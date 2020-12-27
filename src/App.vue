<template>
  <Nav v-show="isLogged"/>
  <router-view/>
</template>

<script>
import Nav from '@/components/Nav.vue'
import firebase from '@/firebaseinit.js';

export default {
  data() {
    return {
      isLogged: true
    }
  },
  components: {
    Nav
  },
  mounted() {
    // not working.....
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
      }
    });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
