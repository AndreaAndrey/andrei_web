<template>
  <div class="home">
    <ImgList/>
  </div>
  <BackToTop />
</template>

<script>
// @ is an alias to /src
import ImgList from '@/components/ImgList.vue';
import BackToTop from '@/components/BackToTop.vue';

export default {
  name: 'Home',
  components: {
    ImgList,
    BackToTop
  }
}
</script>
