<template>
  <h3> LIST IMAGES </h3>
  <div style="display:inline-block; margin: auto;">
    <p>Select page number: <input id="page_num" v-model.number="page" type="number" min="1" placeholder="1"></p>
    <pagination v-model="page" :records="total_files" :per-page="per_page" @paginate="page_changed"/>
  </div>
  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <ul>
    <li v-for="img in images" :key="img.name">
      {{ img.name }} - {{ img.size }}
      <img v-bind:src="img.img_data"/>
    </li>
  </ul>
</template>

<script>
// Import component
import Loading from 'vue3-loading-overlay';
// Import stylesheet
// import 'vue3-loading-overlay/dist/vue-loading.css';
import Pagination from 'v-pagination-3';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

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

export default {
  name: "ImgList",
  data() {
    return {
      images: [],
      isLoading: true,
      fullPage: true,
      page: 1,
      per_page: 15,
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
    }
  },
  components: {
    Loading,
    Pagination
  },
  async mounted() {
    await this.$store.dispatch('getFiles');
    this.page_changed();
  },
  methods: {
    page_changed() {
      if(this.page < 1){
        return;
      }
      this.isLoading = true;
      this.images = [];
      let children_list = this.$store.state.file_list.slice((this.page-1)*this.per_page, this.page*this.per_page); // Slice it and just get a small amount

      Promise.all(children_list.map(async x => {
          var img_data = await download_file(x);
          return {name : x.name, size : x.size, timestamp : x.timestamp, img_data : 'data:image/gif;base64,'+ img_data}
        })
      ).then((img_list) => {
        this.isLoading = false;
        this.images = img_list;
      });
    }
  }
}

</script>

<style>

</style>