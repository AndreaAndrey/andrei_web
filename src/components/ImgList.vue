<template>
  <h3> LIST IMAGES </h3>
  <div style="display:inline-block; margin: auto;">
    <div class="tag-list">
        <h5>Common Tags</h5>
        <span class="tag" v-for="tag in tag_list.slice(0,10)" :key="tag.tag" :class="{ active_tag: tag_search.split(' ').includes(tag.tag)}" @click="add_tag_search(tag.tag)">
          {{tag.tag}}
        </span>
    </div>
    <p>Search by <b>tag</b>: <input v-model="tag_search" placeholder="edit me" @keyup.enter="search_by_tag"> <button @click="search_by_tag">Search</button> <button v-if="tag_search" @click="delete_search">X</button></p>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="and_c" value="and" v-model="and_c">
      <label class="form-check-label" for="and_c">AND/OR (active -> AND)</label>
    </div>
    <br>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="all_c" value="all" v-model="all_c">
      <label class="form-check-label" for="all_c">All</label>
    </div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="image_c" value="image" v-model="image_c" :disabled="all_c">
      <label class="form-check-label" for="image_c">Image</label>
    </div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="video_c" value="video" v-model="video_c" :disabled="all_c">
      <label class="form-check-label" for="video_c">Video</label>
    </div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="audio_c" value="audio" v-model="audio_c" :disabled="all_c">
      <label class="form-check-label" for="audio_c">Audio</label>
    </div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="pdf_c" value="pdf" v-model="pdf_c" :disabled="all_c">
      <label class="form-check-label" for="pdf_c">PDF</label>
    </div>
  </div>

  <div style="width: 100%;"><hr></div>

  <div style="display:inline-block; margin: auto;">
    <p>Select <b>page number</b>: <input id="page_num" v-model.number="page_select" type="number" min="1" placeholder="1" @keyup.enter="go_to"> <button @click="go_to">Go</button> </p>
    <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
  </div>
  <div style="width: 100%"><hr></div>

  <modal v-if="showModal" @close="showModal = false" :panel_obj="panel_obj"></modal>

  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <div class="gallery" v-for="img in images" :key="img.name">
    <img :src="img.media_data" @click="view_image(img)">
    <div class="desc">{{ img.name }}</div>
    <div class="desc">Tags: <span class="tag" v-for="t in file2tags[img.name]" :key="t + img.name">{{t}}</span></div>
  </div>
</template>

<script>
// Import component
import Loading from 'vue3-loading-overlay';
// Import stylesheet
// import 'vue3-loading-overlay/dist/vue-loading.css';
import Pagination from 'v-pagination-3';
import Modal from './MediaPanel';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

// Transform callback based method into proper async function with Promises
let download_file = async (file) => {
  return new Promise(
    (resolve, reject) => {
      file.download((err, data) => {
        if (err) reject(err);
        resolve(data.toString("base64"));
      })
    }
  );
};

const img_ext = ["jpg", "JPG", "jpeg", "gif", "PNG", "png"];
const vid_ext = ["mp4"];
const aud_ext = ["m4a", "acc", "mp3"];
const pdf_ext = ["pdf", "PDF"];

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      panel_obj: {},
      showModal: false,
      isLoading: true,
      fullPage: true,
      page: 1,
      page_select: 1,
      tag_search: '',
      per_page: 12,
      filter_condition: null,
      all_c: true,
      image_c: false,
      video_c: false,
      audio_c: false,
      pdf_c: false,
      and_c: true
    }
  },
  computed: {
    total_files: function () {
      return this.file_list.length;
    },
    type_condition: function () {
      if(this.all_c || (!this.image_c && !this.video_c && !this.audio_c && !this.pdf_c)) {
        return null;
      } else {
        var allowed = []
        if(this.image_c) allowed.push(...img_ext);
        if(this.video_c) allowed.push(...vid_ext);
        if(this.audio_c) allowed.push(...aud_ext);
        if(this.pdf_c)   allowed.push(...pdf_ext);
        return file => allowed.includes(file.name.split('.').pop());
      }
    },
    file_list: function () {
      var total_filter = null;
      if(this.filter_condition || this.type_condition){
        if(this.filter_condition && this.type_condition){
          total_filter = file => this.filter_condition(file) && this.type_condition(file);
        } else if(this.filter_condition) {
          total_filter = this.filter_condition;
        } else {
          total_filter = this.type_condition;
        }
      }
      return this.$store.getters.get_list(total_filter);
    },
    tag_list: function () {
      return this.$store.state.tag_list;
    },
    file2tags: function () {
      return this.$store.state.file2tags;
    },
    audio_icon () {
      return require('@/assets/audio.png')
    },
    video_icon () {
      return require('@/assets/video.png')
    },
    pdf_icon () {
      return require('@/assets/pdf.png')
    }
  },
  components: {
    Loading,
    Pagination,
    Modal
  },
  async mounted() {
    // Not awaiting this as this is continuously run to get push updates from DB
    this.$store.dispatch('getTags');

    await this.$store.dispatch('getFiles');
    // this.page_changed(); // No need because of the watcher
  },
  methods: {
    go_to(){
      if(this.page_select < 1){
        return;
      }
      this.page = this.page_select;
    },
    page_changed() {
      if(this.page < 1){
        return;
      }
      this.page_select = this.page;
      this.isLoading = true;
      this.images = [];

      let children_list = this.file_list.slice((this.page-1)*this.per_page, this.page*this.per_page); // Slice it and just get a small amount

      Promise.all(children_list.map(async x => {
          let extension = x.name.split('.').pop();
          var media_data = '';
          if(aud_ext.includes(extension)){
            media_data = this.audio_icon;
          } else if(vid_ext.includes(extension)){
            media_data = this.video_icon;
          } else if(pdf_ext.includes(extension)){
            media_data = this.pdf_icon;
          } else {
            media_data = await download_file(x);
            media_data = 'data:image/gif;base64,'+media_data;
          }
          return {name : x.name, size : x.size, timestamp : x.timestamp, media_data : media_data, obj: x}
        })
      ).then((img_list) => {
        this.isLoading = false;
        this.images = img_list;
      });
    },
    view_image(img){
      console.log(img.name);
      this.panel_obj= img;
      this.showModal = true;
    },
    search_by_tag(){
      this.page = 1; // reset page to the first

      if(this.tag_search){
        let valid_names = []
        if(this.and_c){
          this.tag_list.forEach(tag => {
            if(this.tag_search.split(" ").some(t => tag.tag.includes(t))){
              const tag_files = tag.files.map(f => f.filename);
              valid_names.push(tag_files)
            }
          });

          this.filter_condition = file => valid_names.every(f_list => f_list.includes(file.name));
        } else {
          this.tag_list.forEach(tag => {
            if(this.tag_search.split(" ").some(t => tag.tag.includes(t))){
              const tag_files = tag.files.map(f => f.filename);
              valid_names.push(...tag_files)
            }
          });

          this.filter_condition = file => valid_names.includes(file.name);
        }
      } else {
        this.filter_condition = null;
      }
      this.page_changed();
    },
    add_tag_search(tag_){
      this.tag_search = tag_;
      this.search_by_tag();
    },
    delete_search(){
      this.tag_search = "";
      this.search_by_tag();
    }
  },
  watch: {
    file_list: {
      handler(n, o){
        console.log("Watch file_list");
        if(n.length != o.length){
          this.search_by_tag();
        }
      },
      deep: false
    },
    and_c(){
      if(this.tag_search){
        this.search_by_tag();
      }
    }
  }
}
</script>

<style>
div.gallery {
  margin: 5px;
  border: 1px solid #ccc;
  float: left;
  width: 250px;
  height: 320px;
}

div.gallery:hover {
  border: 1px solid #777;
}

div.gallery img {
  /* width: 100%;
  height: auto; */
  max-width:250px;
  max-height:250px;
  /* height:auto !important; */
  object-fit: contain;
}

div.desc {
  padding: 15px;
  text-align: center;
}

.tag-list{
  border: 1px solid #aa8;
  margin: 10px;
  padding: 10px;
}

.tag {
  margin: 2px 3px;
  padding: 5px 8px 5px 10px;
  border-radius:5px;
  background-color: #9bd;
  color: #ffff;
}

.active_tag {
  background-color: rgb(48, 145, 241) !important;
  font-weight: bold;
}
</style>