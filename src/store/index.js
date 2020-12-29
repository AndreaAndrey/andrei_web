import { createStore } from 'vuex';
import firebase from '@/firebaseinit.js';
import { File } from '@/../node_modules/megajs/dist/main.browser-es.js';
// import { File } from 'megajs';

const db = firebase.firestore();

// Transform callback based method into proper async function with Promises
let load_attributes = async (file) => {
  return new Promise(
    (resolve, reject) => {
      file.loadAttributes((err, folder) => {
        if (err) reject(err);
        resolve(folder.children);
      });
    }
  );
};

export default createStore({
  state: {
    file_list: [],
    folder_url: "",
    tag_list: [],
    tag_loading: false
  },
  mutations: {
    setFolderUrl(state, url) {
      state.folder_url = url;
    },
    setFileList(state, file_list){
      state.file_list = file_list;
    },
    setTagLoading(state, l){
      state.tag_loading = l;
    },
    setTagList(state, tl){
      state.tag_list = tl;
    }
  },
  actions: {
    async getFiles({commit, state}) {
      if(state.file_list.length == 0){
        const folder_url_doc = await db.collection('folder_url').doc('folder_url').get();
        const folder_url = folder_url_doc.data()["url"];
        commit("setFolderUrl", folder_url);

        let file = File.fromURL(folder_url);
        const file_list = await load_attributes(file);
        commit("setFileList", file_list);
        return true;
      } else {
        return false;
      }
    },
    async getTags({commit, state}) {
      if(!state.tag_loading){
        commit("setTagLoading", true);
        firebase.database().ref("/tagging_db").on('value', function(snapshot){
            let returnArr = [];
            snapshot.forEach(function(childSnapshot) {
              const value = childSnapshot.val();
              let files =Object.keys(value)
              .map(function(key) {
                  return value[key];
              });
              returnArr.push({
                tag: childSnapshot.key,
                files: files
              });
            });
            returnArr.sort((a, b) => {return b.files.length - a.files.length});
            commit("setTagList", returnArr);
        });
      }
    }
  },
  modules: {
  },
  getters: {
    get_list: (state) => (filter_condition) => {
      if(filter_condition){
        return state.file_list.filter(filter_condition);
      } else {
        return state.file_list;
      }
    }
  }
})
