<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <h3>{{panel_obj.name}}</h3> <button @click="$emit('close')">X</button>
          </div>

          <loading :active="isLoading" :can-cancel="false" id="modal_loader"></loading>

          <div v-if="!isLoading" class="modal-body">
            <img class="media_tag" v-if="file_type == 'img'" :src="panel_obj.media_data">

            <video class="media_tag" v-if="file_type == 'video'" controls>
              <source :src="'data:video/mp4;base64,'+media_data" type="video/mp4">
            Your browser does not support the video tag.
            </video>

            <audio v-if="file_type == 'audio'" controls>
              <source :src="'data:audio/ogg;base64,'+media_data" type="audio/mpeg">
            Your browser does not support the audio element.
            </audio>

            <!-- <pdf class="media_tag" v-if="file_type == 'pdf'" :src="'data:application/pdf;base64,'+media_data"></pdf> -->
            <pdf class="media_tag" v-if="file_type == 'pdf'" :src="window.atob(media_data)"></pdf>
            <!-- <pdf class="media_tag" v-if="file_type == 'pdf'" src="https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf"></pdf> -->
          </div>

          <div class="modal-footer">
            Tag list
            <input id="input_tag" :placeholder="file_tags" v-model="tag_list">
            <button @click="addTag">Save</button>
            <button class="modal-default-button" @click="$emit('close')">
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
import pdf from 'pdfvuer';

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

// const img_ext = ["jpg", "JPG", "jpeg", "gif", "PNG", "png"];
const vid_ext = ["mp4"];
const aud_ext = ["m4a", "acc", "mp3"];
const pdf_ext = ["pdf", "PDF"];

export default {
  name: "Modal",
  watch: {
    // _panel_obj: {
    //   handler(val){
    //     console.log("Whatcher");
    //     console.log(val);
    //   },
    //   deep:true,
    //   immediate: true,

    // }
    // ,
    _panel_obj_name: {
      handler(){
        console.log("Whatcher");
        var copied_panel = Object.assign({}, this.panel_obj);
        //console.log('Prop changed: ', n, ' | was: ', o);
        if(this.file_type != 'img'){
          this.isLoading = true;
          console.log("W Video");
          copied_panel.obj.download((err, data) => {
            if (err){
              this.media_data = '';
            }
            this.media_data = data.toString("base64");
            this.isLoading = false;
          });
        }
      },
      deep:true,
      immediate: true,
    }
  },
  props: {
    panel_obj: Object,
  },
  data() {
    return {
      media_data: null,
      isLoading: false,
      tag_list: ''
    };
  },
  components: {
    Loading,
    pdf
  },
  computed: {
    _panel_obj(){
      console.log('comp panel obj')
      return this.panel_obj;
    },
    _panel_obj_name(){
      return this.panel_obj.name;
    }
    ,
    file2tags: function () {
      return this.$store.state.file2tags;
    },
    file_ext(){
      return this.panel_obj.name.split('.').pop();
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
    file_tags(){
      var tags = '';
      if(this.panel_obj.name in this.file2tags){
        this.file2tags[this.panel_obj.name].forEach(t => {
          tags = tags + t + " ";
        });
      }
      return tags;
    }
  },
  methods: {
    addTag(){
      //add the tag to the datbase tag_list
      let tag_list_ref = firebase.database().ref("/tag_list");
      tag_list_ref.child(filename_2_firekey(this.tag_list)).set({
        tag_name: this.tag_list
      });

      //tagging_db is pointing to the path /tagging_db in DB
      let tagging_db = firebase.database().ref("/tagging_db");

      //create or replaces a path in /tagging_db/$tag_input/encoded(img.name)
      var tagref = tagging_db.child(this.tag_list).child(filename_2_firekey(this.panel_obj.name));
      //Setting data to that path
      tagref.set({
        filename: this.panel_obj.name,
        size: this.panel_obj.size
      });
      console.log('Added '+ this.panel_obj.name + ' to tag ' + this.tag_list)

      this.tag_list = ''
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
  margin: 20px 0;
}

.modal-default-button {
  display: block;
  margin-top: 1rem;
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