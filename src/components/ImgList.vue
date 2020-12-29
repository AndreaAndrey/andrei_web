<template>
  <h3> LIST IMAGES </h3>
  <div style="display:inline-block; margin: auto;">
    <div class="tag-list">
        <span class="tag" v-for="tag in tag_list" v-bind:key="tag">
          {{tag}}
          <button @click="add_tag_search(tag)">↓</button>
        </span>
    </div>
    <p>Search by tag: <input v-model="tag_search" placeholder="edit me"><button @click="search_by_tag">Search</button> </p>
    <p>Select page number: <input id="page_num" v-model.number="page_select" type="number" min="1" placeholder="1" @keyup.enter="go_to"> <button @click="go_to">Go</button> </p>
    <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
  </div>
  <div style="width: 100%"><hr></div>
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
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

import firebase from '@/firebaseinit.js';


// let asyncFilter = async (arr, predicate) => {
//           const results = await Promise.all(arr.map(predicate));

//           return arr.filter((_v, index) => results[index]);
//         }

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
      tag_list: [],
      file_list_filtered: [],
      isLoading: true,
      fullPage: true,
      page: 1,
      page_select: 1,
      tag_search: '',
      per_page: 12,
      pagination_options: {
        chunk: 10,
        theme: 'bootstrap4',
        format: true,
        edgeNavigation: true,
        chunksNavigation:'scroll'
      }
    }
  },
  computed: {
    total_files: function () {
      return this.$store.state.file_list.length;
    },
    file_list: function () {
      return this.$store.state.file_list;
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
    Pagination
  },
  async mounted() {
    await this.$store.dispatch('getFiles');
    this.file_list_filtered=this.file_list;
    this.page_changed();
    this.retrieve_tags();
  },
  actions: {

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
      console.log('page_changed');
      console.log(this.file_list);
      let children_list = this.file_list_filtered.slice((this.page-1)*this.per_page, this.page*this.per_page); // Slice it and just get a small amount

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
    retrieve_tags(){
      // Find data using the "lists" reference
      let self = this;
      firebase.database().ref("/tag_list").on('value', function(snapshot){
        let returnArr = [];
        //console.log(JSON.stringify(snapshot.val(), null, 2))
        snapshot.forEach(function(childSnapshot) {
          returnArr.push(childSnapshot.val()['tag_name']);
        });
        self.tag_list = returnArr;
      });

    },
    view_image(img){
      console.log(img.name)

      alert("Show image " + img.name);
    },
    search_by_tag(){
      let self = this;
      console.log('self.tag_search');

      console.log(self.tag_search);

      if (self.tag_search){
        var returnArr = [];

        let tagging_db = firebase.database().ref("/tagging_db/"+self.tag_search);

        tagging_db.once('value', function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            returnArr.push(childSnapshot.val()['filename']);
          });
          console.log(returnArr);

          self.file_list_filtered = self.file_list.filter(file => returnArr.includes(file.name));
          console.log(self.file_list_filtered);
          self.page_changed();

      });
    }else{
      self.file_list_filtered = self.file_list;
      self.page_changed();

    }

      //remove a path
      // var sex = firebase.database().ref("/sex");
      // sex.remove();
    },
    add_tag_search(tag_){
      console.log(tag_);
      this.tag_search = tag_;
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

      //read utilities to be used in the future
      // tagging_db.once('value', function(snapshot) {

      //   console.log(JSON.stringify(snapshot.val(), null, 2));

      // });
      // sex.once('value', function(snapshot) {

      //   snapshot.forEach(function(childSnapshot) {
      //     var key = childSnapshot.key;
      //     var data = childSnapshot.val();
      //     console.log(key)
      //     console.log(data)

      //   });
      // });
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
</style>