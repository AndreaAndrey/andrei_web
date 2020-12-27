<template>
  <p> LIST IMAGES </p>
  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <ul>
    <li v-for="img in images" :key="img.name">
      {{ img.name }} - {{ img.size }}
      <img v-bind:src="'data:image/gif;base64,'+ img.img_data" />
    </li>
  </ul>
</template>

<script>
import { File } from '@/../node_modules/megajs/dist/main.browser-es.js'
import firebase from '@/firebaseinit.js';

// Import component
import Loading from 'vue3-loading-overlay';
// Import stylesheet
// import 'vue3-loading-overlay/dist/vue-loading.css';

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

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      isLoading: true,
      fullPage: false,
      folder_url: "",
      start_idx: 0,
      end_idx: 10
    }
  },
  components: {
    Loading
  },
  async mounted() {
    const db = firebase.firestore();
    const folder_url_doc = await db.collection('folder_url').doc('folder_url').get()
    const folder_url = folder_url_doc.data()["url"]
    this.folder_url = folder_url
    console.log(this.folder_url)

    let file = File.fromURL(folder_url)
    file.loadAttributes((err, folder) => {
      if (err) throw err
      console.log(folder.name) // 'Test Folder'

      let children_list = folder.children.slice(this.start_idx, this.end_idx) // Slice it and just get a small amount

      Promise.all(children_list.map(async x => {
          var img_data = await download_file(x);
          console.log("Downloaded file");
          return {name : x.name, size : x.size, timestamp : x.timestamp, img_data : img_data}
        })
      ).then((img_list) => {
        this.isLoading = false;
        this.images = img_list;
      });
    })
  }
}

</script>

<style>

</style>