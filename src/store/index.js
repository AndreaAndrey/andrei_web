import { createStore } from 'vuex';
import firebase from '@/firebaseinit.js';
import { File } from '@/../node_modules/megajs/dist/main.browser-es.js';
// import { File } from 'megajs';
import LRU from 'lru-cache';

const cache_options = {
  max: 100000000, // 100 MB
  length: function (n, key) { return n.length + key.length}, // string length is in bytes
  maxAge: 1000 * 60 * 60 // 1h
}

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

let clean_name = (name) => name.replace("VIDEO-", "").replace("PHOTO-", "").replace("GIF-", "").replace("AUDIO-", "");

export default createStore({
  state: {
    file_list: [], // list of MEGA files with name, size and the download function
    folder_url: "", // remote MEGA URL
    tag_list: [], // list of tags where for each tag there is a list of files
    tag_loading: false, // if the DB remote connection is alive or not
    file2tags: {}, // dictionary where for each file, the value is the tags
    cache: new LRU(cache_options)
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
    get_list: (state) => (filter_condition, sort=false) => {
      var list;
      if(filter_condition){
        list = state.file_list.filter(filter_condition);
      } else {
        list = state.file_list;
      }
      if(sort){
        list.sort((a, b) => {
          const a_s = clean_name(a.name);
          const b_s = clean_name(b.name);
          return a_s.localeCompare(b_s);
        });
      }
      return list;
    }
  }
})
