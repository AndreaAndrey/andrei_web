<template>
  <p> LIST IMAGES </p>
  <div id="app-5">
        <img v-bind:src="'data:image/gif;base64,'+ imageAsBase64" />
        <button v-on:click="download_first">Download First</button>
  </div>
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
      folder_url: "",
      message: 'Hello Vue.js!',
      imageAsBase64:""
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
      this.images = folder.children.map(x => ({name : x.name, size : x.size, timestamp : x.timestamp, obj : x}))
      this.isLoading = false
    })
  },
  methods: {
    download_first: function () {

      let file = File.fromURL(this.folder_url)
      console.log(file)
      
      file.loadAttributes((err, folder) => {
      if (err) throw err
      console.log(folder.name) // 'Test Folder'

      // Get the first file in the folder
      const file = folder.children[0]
      console.log(file.name) // "hello-world.txt"
      console.log(file.size) // 12 (bytes)

      // Files can be used as normal shared files, for example:
      file.download((err, data) => {
        if (err) throw err
        console.log(data.toString("base64")) // "Hello World!"
      this.imageAsBase64=data.toString("base64")
      })
    })
    //   this.message = this.message.split('').reverse().join('')
    }
  }
}

</script>

<style>

</style>