<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const year = new Date().getFullYear()
const route = useRoute()

const isWhatsappVisible = ref(false)

let revealHandler: (() => void) | undefined
let whatsappTimer: number | undefined

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

  whatsappTimer = window.setTimeout(() => {
    isWhatsappVisible.value = true
  }, 1000)
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

  if (whatsappTimer) {
    window.clearTimeout(whatsappTimer)
  }
})
</script>

<template>
  <div class="app-shell"> 
    <header class="site-header">
      <div class="container nav-shell">
        <RouterLink class="logo" to="/" aria-label="Duratex Middle East home">
          <img src="/logoduratex.png" alt="Duratex Middle East" />
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
          <p class="muted">
                DUBAI COMMERCITY UMM RAMOOL 
                11 17th St – BUILDING B2, Floor 1, Umm Ramool – DUBAI-UAE Office 1099.
          </p>
          <p class="muted">Office 102, 103</p>
          <a class="footer-link" href="mailto:info@duratex.co">info@duratex.co</a>
          
          <a class="footer-link" href="tel:+971545981975">+971 54 598 1975</a>
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

    <a
      class="whatsapp-fab"
      :class="{ visible: isWhatsappVisible }"
      href="https://wa.me/971545981975"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Duratex Middle East on WhatsApp"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 2a9.98 9.98 0 0 0-8.57 15.1L2 22l4.99-1.34A10 10 0 1 0 12 2zm5.83 14.2c-.24.67-1.2 1.25-1.85 1.36-.49.09-1.13.16-3.29-.73-2.76-1.14-4.54-3.93-4.68-4.12-.14-.19-1.12-1.49-1.12-2.84 0-1.35.7-2.01.95-2.28.24-.26.52-.33.69-.33h.5c.16 0 .38-.06.6.46.24.58.82 2 .9 2.14.07.15.12.32.03.51-.08.19-.12.31-.25.48-.12.16-.26.35-.37.47-.12.13-.24.27-.1.52.14.25.62 1.02 1.33 1.65.9.8 1.66 1.05 1.9 1.16.24.1.38.09.53-.06.16-.16.65-.76.83-1.02.18-.26.36-.21.61-.13.24.08 1.54.73 1.8.86.27.13.45.2.52.31.07.12.07.69-.17 1.36z"
        />
      </svg>
      <span class="whatsapp-tooltip">Chat with us!</span>
    </a>
  </div>
</template>
