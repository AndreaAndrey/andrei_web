<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/tags">Tags</router-link> |
    <router-link to="/instructions">Instructions</router-link> |
    <router-link to="/about">About</router-link>
  </div>
</template>

<script>
export default {
    name: "Navbar",
}
</script>

<style>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #417cb6;
}
</style>