import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Instructions from '../views/Instructions.vue'
import Login from '../views/Login.vue'
import firebase from '@/firebaseinit.js'

const routes = [
  {
    path:"/login",
    name: "login",
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/instructions',
    name: 'Instructions',
    component: Instructions,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !await firebase.getCurrentUser()) {
    next('login');
  } else {
    next();
  }
})

export default router
