<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const year = new Date().getFullYear()
const route = useRoute()

let revealHandler: (() => void) | undefined

const updateReveals = () => {
  if (typeof window === 'undefined') return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
      element.classList.add('is-visible')
    })
    return
  }

  document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((element) => {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const inView = rect.top < viewportHeight * 0.92 && rect.bottom > 0

    if (inView) {
      element.classList.add('is-visible')
    }
  })
}

onMounted(async () => {
  await nextTick()

  revealHandler = () => updateReveals()
  window.addEventListener('scroll', revealHandler, { passive: true })
  window.addEventListener('resize', revealHandler)
  window.addEventListener('orientationchange', revealHandler)

  updateReveals()
  window.setTimeout(updateReveals, 100)
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    updateReveals()
    window.setTimeout(updateReveals, 100)
  }
)

onBeforeUnmount(() => {
  if (revealHandler) {
    window.removeEventListener('scroll', revealHandler)
    window.removeEventListener('resize', revealHandler)
    window.removeEventListener('orientationchange', revealHandler)
  }
})
</script>

<template>
  <div class="app-shell"> 
    <header class="site-header">
      <div class="container nav-shell">
        <RouterLink class="logo" to="/" aria-label="Duratex Middle East home">
          <img src="/logoduratex.svg" alt="Duratex Middle East" />
        </RouterLink>
        <nav class="nav-links" aria-label="Primary">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/products">Products</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </nav>
        <RouterLink class="button ghost" to="/contact">
          Contact us
        </RouterLink>
      </div>
    </header>

    <main id="main" class="site-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3 class="footer-title">Duratex Middle East</h3>
          <p class="muted">
            Architectural wood surfaces curated for premium interiors across the Gulf.
          </p>
        </div>
        <div>
          <p class="footer-label">Contact</p>
          <p class="muted">Dubai Headquarters</p>
          <p class="muted">11 17th St - Umm Ramool - Dubai - UAE</p>
          <p class="muted">Office 102, 103</p>
          <a class="footer-link" href="mailto:info@duratex.co">info@duratex.co</a>
        </div>
        <div>
          <p class="footer-label">Explore</p>
          <RouterLink class="footer-link" to="/products">Products</RouterLink>
          <RouterLink class="footer-link" :to="{ path: '/products', hash: '#catalog' }">
            Catalog
          </RouterLink>
          <RouterLink class="footer-link" to="/contact">Contact</RouterLink>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>(c) {{ year }} Duratex Middle East. All rights reserved.</span>
        <span class="footer-note">Industrial luxury in engineered wood.</span>
      </div>
    </footer>
  </div>
</template>
