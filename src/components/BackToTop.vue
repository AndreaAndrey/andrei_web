<template>
    <button @click="topFunction" id="_back_button" title="Go to top">{{text}}</button>
</template>

<script>
export default {
  name: 'BackToTop',
  props: {
      text: {
        type: String,
        default: 'Top'
      },
      threshold: {
        type: Number,
        default: 30
      }
    },
  unmounted: function () {
    window.removeEventListener('scroll', this.scrollFunction);
  },
  mounted() {
    window.addEventListener('scroll', this.scrollFunction);
  },
  methods: {
    scrollFunction() {
      var mybutton = document.getElementById("_back_button");
      if (document.body.scrollTop > this.threshold || document.documentElement.scrollTop > this.threshold) {
        mybutton.style.display = "block";
      } else {
        mybutton.style.display = "none";
      }
    },
    topFunction() {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
  }
}
</script>

<style>
#_back_button {
  display: none; /* Hidden by default */
  position: fixed; /* Fixed/sticky position */
  bottom: 20px; /* Place the button at the bottom of the page */
  right: 30px; /* Place the button 30px from the right */
  z-index: 99999; /* Make sure it does not overlap */
  border: none; /* Remove borders */
  outline: none; /* Remove outline */
  background-color: #417cb6; /* Set a background color */
  color: white; /* Text color */
  cursor: pointer; /* Add a mouse pointer on hover */
  padding: 15px; /* Some padding */
  border-radius: 10px; /* Rounded corners */
  font-size: 18px; /* Increase font size */
}

#_back_button:hover {
  background-color: #8db2d6; /* Add a dark-grey background on hover */
}
</style>