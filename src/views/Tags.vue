<template>
  <h1>Tag list</h1>
  <br>
  <ol class="list">
      <li v-for="tag in tag_list" :key="tag.tag">{{tag.tag}} - {{tag.files.length}} files ---> {{perc(tag.files.length)}}%</li>
  </ol>
</template>

<script>
export default {
  name: 'Tags',
  computed: {
    tag_list: function () {
      return this.$store.state.tag_list;
    },
    num_files: function () {
      return this.$store.state.file_list.length;
    }
  },
  methods: {
    perc(num){
      return ((num/this.num_files) * 100).toFixed(2);
    }
  }
}
</script>

<style>
.list {
    margin: 50px;
    text-align: left;
    font-size: 16pt;
}
</style>