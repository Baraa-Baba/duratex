import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Products from '../pages/Products.vue'
import Contact from '../pages/Contact.vue'
import ProductDetail from '../pages/ProductDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/products', name: 'products', component: Products },
    { path: '/products/:slug', name: 'product-detail', component: ProductDetail },
    { path: '/contact', name: 'contact', component: Contact }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
