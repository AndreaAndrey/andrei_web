<template>
    <div>
        <div class="row">
            <div class="col-md-4">
            </div>
            <div class="col-md-4 text-center" style="margin-top: 90px">
            <img src="@/assets/logo.jpg" style="width: 300px; height: auto;">
            <form @submit.prevent="userLogin" style="margin-top: 30px">
                <h3 style="color: white;">Login</h3>

                <div class="form-group">
                    <label>Indirizzo Email</label>
                    <input type="email" class="form-control form-control-lg text-center" v-model="user.email" />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="form-control form-control-lg text-center" v-model="user.password" />
                </div>

                <button type="submit" class="btn btn-dark btn-lg btn-block">Login</button>
            </form>
            </div>
            <div class="col-md-4">
            </div>
        </div>
    </div>
</template>


<script>
import firebase from '@/firebaseinit.js';

export default {
  data() {
    return {
      user: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    userLogin() {
        firebase
        .auth()
        .signInWithEmailAndPassword(this.user.email, this.user.password)
        .then(() => {
            this.$router.push('/')
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  }
};
</script>

<style scoped>
/* Full-width inputs */
input[type=email], input[type=password] {
  width: 90%;
  padding: 12px 20px;
  margin: 8px 5% 8px 5%;
  display: inline-block;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 14pt;
}

/* Set a style for all buttons */
button {
  background-color: #4f83ad;
  color: white;
  padding: 14px 20px;
  margin: 8px 5% 8px 5%;
  border: none;
  cursor: pointer;
  width: 90%;
  font-weight: bold;
  font-size: 14pt;
}

/* Add a hover effect for buttons */
button:hover {
  opacity: 0.8;
}

label {
  font-weight: bold;
  font-size: 14pt;
}
</style>