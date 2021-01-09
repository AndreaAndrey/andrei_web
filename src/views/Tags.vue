<template>
  <loading :active="isLoading"
        :can-cancel="false"></loading>
  <div v-if="!isLoading">
    <h1>Stats</h1>
    <h3 class="text-primary">Tot files      : {{num_files}}</h3>
    <h3 class="text-success">Tagged files   : {{num_tagged}} ---> {{perc(num_tagged)}}%</h3>
    <h3 class="text-danger"> Remaining files: {{num_untagged}} ---> {{perc(num_untagged)}}%</h3>
    <h3 class="text-info">   Tot unique tags: {{num_tags}}</h3>
    <div style="width: 100%;"><hr></div>
    <h1>Tag list</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Tag</th>
          <th>Num files</th>
          <th>Percentage (on tagged)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tag,i) in tag_list" :key="i">
          <th scope="row">{{i+1}}</th>
          <td><span class="tag">{{tag.tag}}</span></td>
          <td>{{tag.files.length}}</td>
          <td>{{perc(tag.files.length, num_tagged)}}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import Loading from 'vue3-loading-overlay';

export default {
  name: 'Tags',
  data() {
    return {
      isLoading: true
    }
  },
  async mounted() {
    this.$store.dispatch('getTags');
    await this.$store.dispatch('getFiles');
    this.isLoading = false;
  },
  computed: {
    tag_list: function () {
      return this.$store.state.tag_list;
    },
    num_tags: function () {
      return this.tag_list.length;
    },
    num_files: function () {
      return this.$store.state.file_list.length;
    },
    num_untagged: function () {
      const filter_condition = file => !(file.name in this.$store.state.file2tags);
      return this.$store.getters.get_list(filter_condition).length;
    },
    num_tagged: function () {
      return this.num_files - this.num_untagged;
    }
  },
  methods: {
    perc(num, tot=this.num_files){
      return ((num/tot) * 100).toFixed(2);
    }
  },
  components: {
    Loading
  }
}
</script>

<style>
table {
  font-size: 16pt;
}
</style>