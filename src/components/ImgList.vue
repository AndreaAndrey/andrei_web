<template>
  <h3> LIST IMAGES </h3>
  <div style="display:inline-block; margin: auto;">
    <div class="tag-list">
        <h5>Common Tags</h5>
        <span class="tag" v-for="tag in tag_list.slice(0,10)" v-bind:key="tag.tag" v-bind:class="{ active_tag: tag_search.split(' ').includes(tag.tag)}" @click="add_tag_search(tag.tag)">
          {{tag.tag}}
        </span>
    </div>
    <p>Search by <b>tag</b>: <input v-model="tag_search" placeholder="edit me" @keyup.enter="search_by_tag"> <button @click="search_by_tag">Search</button> <button v-if="tag_search" @click="delete_search">X</button></p>
    <p>Select <b>page number</b>: <input id="page_num" v-model.number="page_select" type="number" min="1" placeholder="1" @keyup.enter="go_to"> <button @click="go_to">Go</button> </p>
    <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
  </div>
  <div style="width: 100%"><hr></div>

    <modal ref="modalName">
      <template v-slot:header>
        <h1>Modal title</h1>
      </template>

      <template v-slot:body>
        <img v-bind:src="img_panel">
      </template>

      <template v-slot:footer>
        <div>
          <button @click="$refs.modalName.closeModal()">Cancel</button>
          <button @click="$refs.modalName.closeModal()">Save</button>
        </div>
      </template>
    </modal>
  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <div class="gallery" v-for="img in images" :key="img.name">
    <img v-bind:src="img.img_data" @click="view_image(img)">
    <div class="desc">{{ img.name }} - {{ img.size }}</div>
    <button @click="addTag(img)">Add Tag</button>
    <input :id="'input_tag'+img.name" placeholder="edit me">
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

import firebase from '@/firebaseinit.js';

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
//to be moved where it belongs
function filename_2_firekey (filename) {
  const encoded = window.btoa(filename)
    return encoded;
}
//to be moved where it belongs
// function firekey_2_filename (hash) {
//   const decoded = window.atob(hash)

//     return decoded;
// }

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      img_panel: '',
      isLoading: true,
      fullPage: true,
      page: 1,
      page_select: 1,
      tag_search: '',
      per_page: 12,
      filter_condition: null
    }
  },
  computed: {
    total_files: function () {
      return this.file_list.length;
    },
    file_list: function () {
      return this.$store.getters.get_list(this.filter_condition);
    },
    tag_list: function () {
      return this.$store.state.tag_list;
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
    this.page_changed();
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
          var img_data = '';
          if(extension == 'm4a' || extension == 'acc'|| extension == 'mp3'){
            img_data = this.audio_icon;
          } else if(extension == 'mp4'){
            img_data = this.video_icon;
          } else if(extension == 'pdf'){
            img_data = this.pdf_icon;
          } else {
            img_data = await download_file(x);
            img_data = 'data:image/gif;base64,'+img_data;
          }
          return {name : x.name, size : x.size, timestamp : x.timestamp, img_data : img_data, obj: x}
        })
      ).then((img_list) => {
        this.isLoading = false;
        this.images = img_list;
      });
    },
    view_image(img){
      console.log(img.name);

      this.img_panel= img.img_data;

      this.$refs.modalName.openModal();
    },
    search_by_tag(){
      this.page = 1; // reset page to the first

      if(this.tag_search){
        let valid_names = []
        this.tag_list.forEach(tag => {
          if(this.tag_search.split(" ").some(t => tag.tag.includes(t))){
          // if(tag.tag.includes(this.tag_search)){
            const tag_files = tag.files.map(f => f.filename);
            valid_names.push(...tag_files)
          }
        });

        this.filter_condition = file => valid_names.includes(file.name);
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
    },
    addTag(img){
      let input_tag = document.getElementById('input_tag'+img.name).value

      //add the tag to the datbase tag_list
      let tag_list_ref = firebase.database().ref("/tag_list");
      tag_list_ref.child(filename_2_firekey(input_tag)).set({
        tag_name: input_tag
      });

      //tagging_db is pointing to the path /tagging_db in DB
      let tagging_db = firebase.database().ref("/tagging_db");

      //create or replaces a path in /tagging_db/$tag_input/encoded(img.name)
      var tagref = tagging_db.child(input_tag).child(filename_2_firekey(img.name));
      //Setting data to that path
      tagref.set({
        filename: img.name,
        size: img.size
      });
      console.log('Added '+ img.name + ' to tag ' + input_tag)

      document.getElementById('input_tag'+img.name).value='';
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
  ul > * {
    display: inline-block;
  }
}

.tag {
  margin: 2px 3px;
  padding: 5px 8px 5px 10px;
  border-radius:5px;
  background-color: #9bd;
  color: #ffff;
  .delete-btn{
    $db-size: 18px;
    $db-color: $color-neg;
    width: $db-size;
    height: $db-size;
    padding: 0 5px 0 4px;
    color: $db-color;
    border: 1px solid $db-color;
    border-radius: 25%;
    background: none;
    font-size: 1em;
    line-height: $db-size - 6;
  }
}

.active_tag {
  background-color: rgb(48, 145, 241) !important;
  font-weight: bold;
}
</style>