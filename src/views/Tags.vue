<template>
  <h1>Tag list</h1>
  <br>
  <ol class="list">
      <li v-for="tag in tag_list" :key="tag.tag">{{tag.tag}} - {{tag.files.length}} files</li>
  </ol>
</template>

<script>
export default {
  name: 'Tags',
  computed: {
    tag_list: function () {
      return this.$store.state.tag_list;
    },
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