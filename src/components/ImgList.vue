<template>
  <p> LIST IMAGES </p>
  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <ul>
    <li v-for="img in images" :key="img.name">
      {{ img.name }} - {{ img.size }}
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

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      isLoading: true,
      fullPage: false,
      folder_url: ""
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
    let file = File.fromURL(folder_url)
    file.loadAttributes((err, folder) => {
      if (err) throw err
      console.log(folder.name) // 'Test Folder'
      this.images = folder.children.map(x => ({name : x.name, size : x.size, timestamp : x.timestamp, obj : x}))
      this.isLoading = false
    })
  }
}
</script>

<style>

</style>