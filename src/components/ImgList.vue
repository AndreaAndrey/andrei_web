<template>
  <h3> LIST IMAGES </h3>
  <div style="display:inline-block; margin: auto;">
    <div class="tag-list">
        <h5>Common Tags</h5>
        <span class="tag" v-for="tag in tag_list.slice(0,10)" :key="tag.tag" :class="{ active_tag: tag_search.split(' ').includes(tag.tag)}" @click="add_tag_search(tag.tag)">
          {{tag.tag}}
        </span>
    </div>
    <p>Search by <b>tag</b>:
      <input v-model="tag_search" placeholder="Search tags, use '' for exact, use - to exclude." :disabled="untagged"
            @keyup.enter="search_by_tag" @focus="text_on = true" @blur="text_on = false" id="search_in">
      <button @click="search_by_tag">Search</button> <button v-if="tag_search" @click="delete_search">X</button>
    </p>
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
    <br>
    <button @click="show_untagged">Show Untagged</button>
    <button v-if="untagged" @click="show_all"> X </button>
    <br>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="sort_c" value="sort_c" v-model="sort_c">
      <label class="form-check-label" for="sort_c">Sort by date</label>
    </div>
  </div>

  <div style="width: 100%;"><hr></div>

  <div style="display:inline-block; margin: auto;">
    <p>Select <b>page number</b>:
      <input id="page_num" v-model.number="page_select" type="number" min="1" placeholder="1"
            @keyup.enter="go_to" @focus="text_on = true" @blur="text_on = false">
      <button @click="go_to">Go</button>
    </p>
    <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
  </div>
  <div style="width: 100%"><hr></div>

  <modal v-if="showModal" @close="close_modal" :panel_obj="panel_obj" :key="panel_obj"></modal>

  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <div class="gallery" v-for="img in images" :key="img.name">
    <img :src="img.media_data" @click="view_image(img)">
    <div class="desc">{{ img.name }}</div>
    <button @click="add_elimina_tag(img)">elimina</button>
    <div class="desc">Tags: <span class="tag" v-for="t in file2tags[img.name]" :key="t + img.name">{{t}}</span></div>
  </div>

  <h1 v-if="images.length == 0 && !isLoading">No Files</h1>

  <div style="width: 100%"><hr></div>
<!--   <div>
    <div class="footer">
      <span style="display:inline-block; margin: auto;">
        <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
      </span>
    </div>
  </div> -->

  <Keypress key-event="keyup" :key-code="39" :preventDefault="true" @success="next_page" />
  <Keypress key-event="keyup" :key-code="37" :preventDefault="true" @success="prev_page" />
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

import { defineAsyncComponent } from 'vue';

import firebase from '@/firebaseinit.js';

function filename_2_firekey (filename) {
  const encoded = window.btoa(filename)
    return encoded;
}

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

// const stringHashCode = str => {
//   let hash = 0
//   for (let i = 0; i < str.length; ++i)
//     hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0

//   return hash
// }

const img_ext = ["jpg", "JPG", "jpeg", "gif", "PNG", "png"];
const vid_ext = ["mp4"];
const aud_ext = ["m4a", "acc", "mp3", "aac"];
const pdf_ext = ["pdf", "PDF"];

let clean_name = (name) => name.replace("VIDEO-", "").replace("PHOTO-", "").replace("GIF-", "").replace("AUDIO-", "");

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      panel_obj: null,
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
      and_c: true,
      sort_c: false,
      untagged: false,
      text_on: false
    }
  },
  computed: {
    cache: function () {
      return this.$store.state.cache;
    },
    cache_length: function () {
      return this.$store.state.cache.length;
    },
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
    max_page: function () {
      return Math.ceil(this.total_files / this.per_page);
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
    Modal,
    Keypress: defineAsyncComponent(() => import('vue3-keypress'))
  },
  async mounted() {
    // Not awaiting this as this is continuously run to get push updates from DB
    this.$store.dispatch('getTags');

    await this.$store.dispatch('getFiles');
    this.isLoading = true;
    this.page_changed();
  },
  methods: {
    add_elimina_tag(img){
      let input_tag = 'elimina'

      //tagging_db is pointing to the path /tagging_db in DB
      let tagging_db = firebase.database().ref("/tagging_db");
      var tagref = tagging_db.child(input_tag).child(filename_2_firekey(img.name));
      //Setting data to that path
      tagref.set({
        filename: img.name,
        size: img.size
      });
      console.log('Added '+ img.name + ' to tag ' + input_tag)

    },
    go_to(){
      if(this.page_select < 1){
        return;
      }
      if(this.page_select > this.max_page){
        this.page_select = this.max_page;
      }
      this.page = this.page_select;
    },
    page_changed() {
      console.log("page changed");
      if(this.page < 1){
        return;
      }
      this.page_select = this.page;
      this.isLoading = true;
      this.images = [];

      var clone_list = [...this.file_list];
      if(this.sort_c){
        clone_list.sort((a, b) => {
          const a_s = clean_name(a.name);
          const b_s = clean_name(b.name);
          return a_s.localeCompare(b_s);
        });
      }

      let children_list = clone_list.slice((this.page-1)*this.per_page, this.page*this.per_page); // Slice it and just get a small amount

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
            media_data = this.cache.get(x.name);
            if(!media_data){
              media_data = await download_file(x);
              this.cache.set(x.name, media_data);
            }
            media_data = 'data:image/gif;base64,' + media_data;
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
      this.panel_obj= img.name;
      this.showModal = true;
    },
    close_modal(){
      this.panel_obj= null;
      this.showModal = false;
    },
    search_by_tag(){
      if(!this.untagged){
        this.page = 1; // reset page to the first

        if(this.tag_search){
          this.tag_search = this.tag_search.toLowerCase();
          const exact_regex = /"\w+"|'\w+'/g; // regex to understand if it is an exact search: "tag"
          let valid_names = [];
          let remove_names = [];
          if(this.and_c){
            this.tag_search.split(" ").forEach(t_s => {
              var t_names = [];
              var remove_tag = false;
              if(t_s.charAt(0) === "-" || ((t_s.charAt(0) === "'" || t_s.charAt(0) === "\"") && t_s.charAt(1) === "-")){ // if remove tag search
                t_s = t_s.replace("-", "");
                remove_tag = true;
              }
              if(t_s.match(exact_regex)){ // if exact search
                t_s = t_s.replaceAll("'", "").replaceAll("\"", "");
                this.tag_list.forEach(tag => {
                  if(tag.tag === t_s){
                    const tag_files = tag.files.map(f => f.filename);
                    t_names.push(...tag_files);
                  }
                });
              } else { // if fuzzy search
                this.tag_list.forEach(tag => {
                  if(tag.tag.includes(t_s)){
                    const tag_files = tag.files.map(f => f.filename);
                    t_names.push(...tag_files);
                  }
                });
              }
              if(remove_tag){
                remove_names.push(...t_names);
              } else {
                valid_names.push(t_names);
              }
            });
            if(valid_names.length == 0){
              valid_names = [[]];
            }
            this.filter_condition = file => valid_names.every(f_list => f_list.includes(file.name)) && !remove_names.includes(file.name);
          } else {
            this.tag_list.forEach(tag => {
              if(this.tag_search.split(" ").some(t => {
                  if(t.charAt(0) === "-" || ((t.charAt(0) === "'" || t.charAt(0) === "\"") && t.charAt(1) === "-")){ // if remove tag search
                    return false;
                  }
                  if(t.match(exact_regex)) { // if exact search
                    t = t.replaceAll("'", "").replaceAll("\"", "");
                    return tag.tag === t;
                  } else { // if fuzzy search
                    return tag.tag.includes(t);
                  }
                }))
              {
                const tag_files = tag.files.map(f => f.filename);
                valid_names.push(...tag_files);
              }
              if(this.tag_search.split(" ").some(t => {
                  if(t.charAt(0) === "-" || ((t.charAt(0) === "'" || t.charAt(0) === "\"") && t.charAt(1) === "-")){ // if remove tag search
                    t.replace("-", "");
                    if(t.match(exact_regex)) { // if exact search
                      t = t.replaceAll("'", "").replaceAll("\"", "");
                      return tag.tag === t;
                    } else { // if fuzzy search
                      return tag.tag.includes(t);
                    }
                  } else {
                    return false;
                  }
                }))
              {
                const tag_files = tag.files.map(f => f.filename);
                remove_names.push(...tag_files);
              }
            });

            this.filter_condition = file => valid_names.includes(file.name) && !remove_names.includes(file.name);
          }
        } else {
          this.filter_condition = null;
        }
      }
    },
    add_tag_search(tag_){
      this.untagged = false;
      this.tag_search = tag_;
      this.search_by_tag();
    },
    delete_search(){
      this.tag_search = "";
      this.search_by_tag();
    },
    show_untagged(){
      this.untagged = true;
      this.page = 1;
      this.filter_condition = file => !(file.name in this.file2tags);
      // this.page_changed(); // No need because there is a watcher on the file list, and file list changes when I change filter_condition
    },
    show_all(){
      this.untagged = false;
      this.search_by_tag();
    },
    next_page(){
      if(!this.text_on && !this.showModal){
        var next = this.page + 1;
        if(next > this.max_page){
          this.page = this.max_page;
        } else {
          this.page = next;
        }
      }
    },
    prev_page(){
      if(!this.text_on && !this.showModal){
        var next = this.page - 1;
        if(next >= 1){
          this.page = next;
        }
      }
    }
  },
  watch: {
    file_list: {
      handler(n, o){
        console.log("Watch file_list");
        if(o != undefined && (n.length != o.length || n.length == 0 || n[0].name != o[0].name)){
          this.page_changed();
        }
      },
      deep: false,
      immediate: false
    },
    and_c(){
      if(this.tag_search){
        this.search_by_tag();
      }
    },
    sort_c(){
      this.page = 1;
      this.page_changed();
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
  height: 400px;
  overflow: hidden;
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex-flow: row wrap;
  overflow: hidden;
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

#search_in {
  width: 450px;
  text-align: center;
}

.footer {
   position: relative;
   left: 0;
   bottom: 0;
   width: 100%;
   text-align: center;
}
.footer_child {
   margin: 0 auto;
}
</style>