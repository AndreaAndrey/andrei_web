<template>
  <Keypress key-event="keyup" :key-code="27" :preventDefault="true" @success="close_panel" /> <!-- If esc is pressed close the modal -->
  <Keypress key-event="keyup" :key-code="9" :preventDefault="true" @success="close_panel" /> <!-- If tab is pressed close the modal -->
  <!-- <Keypress key-event="keyup" :key-code="88" :preventDefault="true" @success="close_panel" /> If X is pressed close the modal -->
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <h3>{{panel_obj}}</h3> <button @click="close_panel"> X </button>
          </div>

          <loading :active="isLoading" :can-cancel="false" id="modal_loader"></loading>

          <div v-if="!isLoading" class="modal-body">
            <img class="media_tag" v-if="file_type == 'img'" :src="'data:image/gif;base64,' + media_data">

            <video class="media_tag" v-if="file_type == 'video'" controls>
              <source :src="'data:video/mp4;base64,'+ media_data" type="video/mp4">
            Your browser does not support the video tag.
            </video>

            <audio v-if="file_type == 'audio'" controls>
              <source :src="'data:audio/ogg;base64,'+ media_data" type="audio/mpeg">
            Your browser does not support the audio element.
            </audio>

            <h5 v-if="file_type == 'pdf'">Open Popup window</h5>

            <!-- <pdf class="media_tag" v-if="file_type == 'pdf'" :src="'data:application/pdf;base64,'+media_data"></pdf> -->
            <!-- <pdf class="media_tag" v-if="file_type == 'pdf'" :src="'data:application/pdf;base64,'+media_data"></pdf> -->
            <!-- <pdf class="media_tag" v-if="file_type == 'pdf'" src="https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf"></pdf> -->
          </div>

          <div class="modal-footer">
            <b class="modal-left">Tag list: </b>
            <input ref="input_tag_label" class="modal-left" id="input_tag" placeholder="Tag List" v-model="tag_list" @keyup.enter="save_tags">
            <button class="modal-default-button" @click="save_tags">Save</button>
            <button class="modal-default-button" @click="close_panel">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Loading from 'vue3-loading-overlay';
import firebase from '@/firebaseinit.js';
import { defineAsyncComponent } from 'vue';
//import pdf from 'pdfvuer';
//import pdf from 'vue-pdf';

/**
 * Display a base64 URL inside an iframe in another window.
 */
function debugBase64(base64URL){
    var win = window.open();
    win.document.write('<iframe src="' + base64URL  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
}
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

// const img_ext = ["jpg", "JPG", "jpeg", "gif", "PNG", "png"];
const vid_ext = ["mp4"];
const aud_ext = ["m4a", "acc", "mp3"];
const pdf_ext = ["pdf", "PDF"];

export default {
  name: "Modal",
  watch: {
    panel_obj: {
      async handler(){
        console.log("Whatcher");
        console.log(this.panel_obj);
        if(this.panel_obj){
          var media_data = this.cache.get(this.panel_obj);
          if(!media_data){
            this.isLoading = true;
            let obj = this.file_obj;
            media_data = await download_file(obj);
            this.cache.set(this.panel_obj, media_data);
          }
          this.media_data = media_data;
          this.isLoading = false;
          if(pdf_ext.includes(this.file_type)){
            debugBase64('data:application/pdf;base64,' + this.media_data);
          }
          this.tag_list = this.file_tags_txt;
        } else {
          this.tag_list = null;
          this.media_data = null;
        }
      },
      immediate: true
    }
  },
  props: {
    panel_obj: String
  },
  data() {
    return {
      media_data: null,
      isLoading: false,
      tag_list: ''
    };
  },
  mounted(){
    this.$refs.input_tag_label.focus();
  },
  components: {
    Loading,
    Keypress: defineAsyncComponent(() => import('vue3-keypress'))
    //,pdf
  },
  computed: {
    cache: function () {
      return this.$store.state.cache;
    },
    file2tags: function () {
      return this.$store.state.file2tags;
    },
    file_tags(){
      if(this.panel_obj){
        return this.file2tags[this.panel_obj];
      } else {
        return [];
      }
    },
    file_ext(){
      if(this.panel_obj){
        return this.panel_obj.split('.').pop();
      } else {
        return '-';
      }
    },
    file_type(){
      let extension = this.file_ext;
      if(aud_ext.includes(extension)){
        return 'audio';
      } else if(vid_ext.includes(extension)){
        return 'video';
      } else if(pdf_ext.includes(extension)){
        return 'pdf';
      } else {
        return 'img';
      }
    },
    file_tags_txt(){
      var tags = '';
      if(this.file_tags){
        this.file_tags.forEach(t => {
          tags = tags + t + " ";
        });
      }
      return tags;
    },
    file_obj(){
      return this.$store.state.file_list.find(f => f.name === this.panel_obj);
    }
  },
  methods: {
    close_panel(){
      this.media_data = null;
      this.tag_list = null;
      this.$emit('close');
    },
    save_tags(){
      var add_tags = [];
      var remove_tags = [];

      var t_l = [];
      if(this.tag_list){
        t_l = this.tag_list.split(" ").map(t => t.toLowerCase());
      }

      var f_t = [];
      if(this.file_tags){
        f_t = this.file_tags;
      }

      f_t.forEach(t => {
        if(!t_l.includes(t)){
          remove_tags.push(t);
        }
      });

      t_l.forEach(t => {
        if(!f_t.includes(t)){
          add_tags.push(t);
        }
      });

      console.log({
        add: add_tags,
        remove: remove_tags
      });

      //tagging_db is pointing to the path /tagging_db in DB
      let tagging_db = firebase.database().ref("/tagging_db");

      add_tags.forEach(t => {
        if(t){
          //create or replaces a path in /tagging_db/$tag_input/encoded(img.name)
          var tagref = tagging_db.child(t).child(filename_2_firekey(this.panel_obj));
          //Setting data to that path
          tagref.set({
            filename: this.panel_obj,
            size: this.file_obj.size
          });
        }
      });

      remove_tags.forEach(t => {
        if(t){
          //create or replaces a path in /tagging_db/$tag_input/encoded(img.name)
          var tagref = tagging_db.child(t).child(filename_2_firekey(this.panel_obj));
          tagref.remove();
        }
      });

      this.tag_list = this.file_tags_txt;
    }
  }
};
</script>

<style scoped>
.media_tag {
  max-width: calc(100vw - 50px);
  max-height: calc(70vh - 50px);
  /* height:auto !important; */
  object-fit: contain;
}

#modal_loader{
  z-index: 9999;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 90%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  display: block;
  width: 100%;
}

.modal-footer {
  margin: 20px 0;
}

.modal-default-button {
  display: block;
  float: right;
}

.modal-left {
  display: block;
  float: left;
}

#input_tag {
  width: 70%;
}
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 50;
}

.modal-leave-active {
  opacity: 50;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>