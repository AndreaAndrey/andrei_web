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
    file_list: [], // list of MEGA files with name, size and the download function
    folder_url: "", // remote MEGA URL
    tag_list: [], // list of tags where for each tag there is a list of files
    tag_loading: false, // if the DB remote connection is alive or not
    file2tags: {} // dictionary where for each file, the value is the tags
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
    },
    set_file2tags(state, ft){
      state.file2tags = ft;
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
    getTags({commit, state}) {
      if(!state.tag_loading){
        commit("setTagLoading", true);
        firebase.database().ref("/tagging_db").on('value', function(snapshot){
            let returnArr = [];
            var file2tags = {};
            snapshot.forEach(function(childSnapshot) {
              const value = childSnapshot.val();
              let files = Object.keys(value)
              .map(function(key) {
                return value[key];
              });
              const tag = childSnapshot.key;
              returnArr.push({
                tag: tag,
                files: files
              });
              files.forEach(e => {
                if (e.filename in file2tags) {
                  file2tags[e.filename].push(tag);
                } else {
                  file2tags[e.filename] = [tag];
                }
              });
            });
            returnArr.sort((a, b) => {return b.files.length - a.files.length});
            commit("setTagList", returnArr);
            commit("set_file2tags", file2tags);
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
