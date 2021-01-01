<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <h3>{{panel_obj.name}}</h3>
          </div>

          <loading :active="isLoading" :can-cancel="false" id="modal_loader"></loading>

          <div v-if="!isLoading" class="modal-body">
            <img class="media_tag" v-if="file_type == 'img'" :src="panel_obj.media_data">

            <video class="media_tag" v-if="file_type == 'video'" controls>
              <source :src="media_data" type="video/mp4">
            Your browser does not support the video tag.
            </video>

            <audio v-if="file_type == 'audio'" controls>
              <source :src="media_data" type="audio/mpeg">
            Your browser does not support the audio element.
            </audio>
          </div>

          <div class="modal-footer">
            Tag list
            <input id="input_tag" placeholder="Tag list" v-model="tag_list">
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
  name: "Modal",
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
    Loading
  },
  computed: {
    file_ext(){
      return this.panel_obj.name.split('.').pop();
    },
    file_type(){
      let extension = this.file_ext;
      if(extension == 'm4a' || extension == 'acc'|| extension == 'mp3'){
        return 'audio';
      } else if(extension == 'mp4'){
        return 'video';
      } else if(extension == 'pdf'){
        return 'pdf';
      } else {
        return 'img';
      }
    }
  },
  watch: {
    'panel_obj.name': function(n, o) {
      console.log("Whatcher");
      console.log('Prop changed: ', n, ' | was: ', o);
      if(this.file_type != 'img'){
        this.isLoading = true;
        console.log("W Video");
        this.panel_obj.obj.download((err, data) => {
          if (err){
            this.media_data = '';
          }
          this.media_data = data.toString("base64");
          this.isLoading = false;
        });
      }
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
  max-width:80%;
  max-height:80%;
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