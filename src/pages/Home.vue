<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import products from '../data/products.json'

type Product = {
  name: string
  slug: string
  image: string
  category?: string
  description?: string
}

type HeroSlide = {
  eyebrow: string
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
  image: string
  kicker: string
}

type StoryCard = {
  title: string
  description: string
  image: string
}

type StatMetric = {
  target: number
  suffix: string
  label: string
}

const allProducts = products as Product[]
const activeSlide = ref(0)
const statsSectionRef = ref<HTMLElement | null>(null)
const animatedStatValues = ref<number[]>([])
let timerId: number | undefined
let statsAnimationId: number | undefined
let statsObserver: IntersectionObserver | undefined
let statsAnimationTimeoutId: number | undefined
let hasAnimatedStats = false

const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'CASACOR SP 2025',
    title: 'Spaces that feel built, lived in, and remembered.',
    description:
      'A calm, editorial home for Duratex in the Middle East, with material stories that move between architecture, interiors, and construction detail without feeling overdesigned.',
    ctaLabel: 'Download E-Book',
    ctaTo: '/products',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/BANNER_MOBILE_4bb481f4ad.png',
    kicker: 'Show highlights and material references'
  },
  {
    eyebrow: 'Recanto Collection 2026',
    title: 'Patterns that turn a room into shelter, memory, and belonging.',
    description:
      'A warmer, more tactile collection story with curated tones drawn from natural surfaces, contemporary interiors, and the practical needs of real projects.',
    ctaLabel: 'Discover Now',
    ctaTo: '/products',
    image: 'https://duratex-site-strapi.prd.cloud.dex.co/assets/Responsivo_b58a62b937.jpg',
    kicker: 'Featured finishes and textures'
  },
  {
    eyebrow: 'Virtual Store',
    title: 'Sample folders and panel references, ready when a project starts.',
    description:
      'For designers, contractors, and specifiers who want to move quickly from inspiration to selection with real surfaces and reliable finish guidance.',
    ctaLabel: 'Shop Now',
    ctaTo: '/contact',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/banner_loja_de_amostras_mobile_745c2c7467.png',
    kicker: 'Request samples and guidance'
  },
  {
    eyebrow: 'DEXperience',
    title: 'A practical specifier program with benefits that feel useful.',
    description:
      'A relationship-focused approach for professionals who need support, not noise, with product knowledge, material updates, and project-ready assistance.',
    ctaLabel: 'Learn More',
    ctaTo: '/contact',
    image: 'https://duratex-site-strapi.prd.cloud.dex.co/assets/banner_dexperience_mobile_0a6e0c7e99.png',
    kicker: 'Specifier support and updates'
  },
  {
    eyebrow: 'Duratex You',
    title: 'A custom path for panels that need a more personal voice.',
    description:
      'Flexible pattern language and practical finish possibilities for projects that need a recognizable, tailored character without losing balance.',
    ctaLabel: 'Learn More',
    ctaTo: '/products',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/banner_duratex_you_mobile_f1f4ec9f64.png',
    kicker: 'Designer-led personalization'
  },
  {
    eyebrow: 'Duratex Inspira',
    title: 'A visual playground for composing environments before anything is built.',
    description:
      'A free tool for mixing patterns, checking combinations, and shaping a project direction in a way that feels quick and human.',
    ctaLabel: 'Access Now',
    ctaTo: '/products',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/banner_Duratex_Inspira_mobile_1c21f1dcea.png',
    kicker: 'Plan combinations with confidence'
  }
]

const featuredProductSlugs = ['azul-astral', 'carvalho-dian', 'verde-floresta', 'prata']
const featuredProducts = computed(() =>
  featuredProductSlugs
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
)

const designStories: StoryCard[] = [
  {
    title: 'Warm, tactile interiors',
    description:
      'Wood tones, soft neutrals, and quieter grains designed for projects that want presence without shouting.',
    image: '/products/carvalho-dian.webp'
  },
  {
    title: 'Architectural color',
    description:
      'Cleaner solids and deeper tones for kitchens, joinery, hospitality, and retail environments.',
    image: '/products/verde-floresta.jpg'
  },
  {
    title: 'Stone and mineral references',
    description:
      'For surfaces that need a more grounded, construction-minded character while staying refined.',
    image: '/products/arenito.jpg'
  }
]

const panelTypes = [
  {
    title: 'MDF Ultra Premium',
    subtitle: 'Moisture resistant',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/ultra_png_da0cbb6a93.webp',
    description:
      'Best for kitchens and bathrooms where the panel needs a little more resilience and a smoother daily life.'
  },
  {
    title: 'MDP BP',
    subtitle: 'Load-bearing structure',
    image: 'https://duratex-site-strapi.prd.cloud.dex.co/assets/mdp_png_dbe42aea77.webp',
    description:
      'A practical option for shelving and straight elements, with a structure that behaves well in real builds.'
  },
  {
    title: 'MDF BP',
    subtitle: 'Furniture and detailing',
    image:
      'https://duratex-site-strapi.prd.cloud.dex.co/assets/MDF_leque_scaled_jpg_7de4539704_2_a2abbc6b8c.webp',
    description:
      'A smoother board for furniture faces, joinery, doors, and the details that need a clean finish.'
  },
  {
    title: 'MDF Fire',
    subtitle: 'Fire-retardant use',
    image: 'https://duratex-site-strapi.prd.cloud.dex.co/assets/fire_1_png_2ca620ee45.webp',
    description:
      'For commercial projects that need the extra conversation around safety, standards, and specification.'
  }
]

const stats: StatMetric[] = [
  { target: 70, suffix: '+ years', label: 'material and manufacturing history' },
  { target: 280, suffix: 'k ha', label: 'FSC-certified forests managed responsibly' },
  { target: 90, suffix: '%+', label: 'renewable energy use in panel plants' },
  { target: 21, suffix: '+ units', label: 'industrial and forestry operations in Brazil' }
]

animatedStatValues.value = stats.map(() => 0)

const slideCount = heroSlides.length
const activeHeroSlide = computed(() => heroSlides[activeSlide.value])

const goToSlide = (index: number) => {
  activeSlide.value = (index + slideCount) % slideCount
}

const nextSlide = () => goToSlide(activeSlide.value + 1)
const previousSlide = () => goToSlide(activeSlide.value - 1)

const formatStatValue = (value: number, suffix: string) => `${value}${suffix}`

const startStatsAnimation = () => {
  if (hasAnimatedStats) return
  hasAnimatedStats = true

  const duration = 1400
  const startTime = performance.now()
  const targets = stats.map((stat) => stat.target)

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) ** 3

    animatedStatValues.value = targets.map((target) => Math.round(target * eased))

    if (progress < 1) {
      statsAnimationId = window.requestAnimationFrame(animate)
    }
  }

  statsAnimationId = window.requestAnimationFrame(animate)
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion) {
    timerId = window.setInterval(nextSlide, 7000)
  }

  if (prefersReducedMotion) {
    animatedStatValues.value = stats.map((stat) => stat.target)
    hasAnimatedStats = true
    return
  }

  statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statsAnimationTimeoutId = window.setTimeout(startStatsAnimation, 260)
          statsObserver?.disconnect()
        }
      })
    },
    { threshold: 0.55 }
  )

  if (statsSectionRef.value) {
    statsObserver.observe(statsSectionRef.value)
  }
})

onBeforeUnmount(() => {
  if (timerId) {
    window.clearInterval(timerId)
  }

  if (statsAnimationId) {
    window.cancelAnimationFrame(statsAnimationId)
  }

  if (statsAnimationTimeoutId) {
    window.clearTimeout(statsAnimationTimeoutId)
  }

  statsObserver?.disconnect()
})
</script>

<template>
  <section class="home-hero section compact">
    <div class="container home-hero-grid reveal" style="--delay: 0.05s">
      <div class="home-hero-copy">
        <p class="eyebrow">Duratex Middle East</p>
        <h1>{{ activeHeroSlide.title }}</h1>
        <p class="home-hero-lead">
          {{ activeHeroSlide.description }}
        </p>
        <div class="hero-actions">
          <RouterLink class="button" :to="activeHeroSlide.ctaTo">
            {{ activeHeroSlide.ctaLabel }}
          </RouterLink>
          <RouterLink class="button ghost" to="/contact">Talk to our team</RouterLink>
        </div> 
      </div>

      <div class="home-hero-visual">
        <div class="home-carousel">
          <button class="carousel-control prev" type="button" aria-label="Previous slide" @click="previousSlide">
            <span aria-hidden="true">›</span>
          </button>
          <img
            class="home-hero-image"
            :src="activeHeroSlide.image"
            :alt="activeHeroSlide.title"
          />
          <div class="home-carousel-caption">
            <p class="eyebrow">Featured story</p>
            <h3>{{ activeHeroSlide.eyebrow }}</h3>
          </div>
          <button class="carousel-control next" type="button" aria-label="Next slide" @click="nextSlide">
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div class="home-carousel-dots" aria-label="Hero slides">
          <button
            v-for="(slide, index) in heroSlides"
            :key="slide.title"
            type="button"
            class="carousel-dot"
            :class="{ active: index === activeSlide }"
            :aria-label="`Show ${slide.title}`"
            @click="goToSlide(index)"
          />
        </div>
      </div>
    </div>
  </section>

  <section class="section compact home-stats-section">
    <div ref="statsSectionRef" class="container stats-shell reveal" style="--delay: 0.1s">
      <div class="stat-strip">
        <div v-for="(stat, index) in stats" :key="stat.label" class="stat-strip-card">
          <span>{{ formatStatValue(animatedStatValues[index] ?? 0, stat.suffix) }}</span>
          <p>{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container section-heading reveal" style="--delay: 0.08s">
      <p class="eyebrow">Inspiration That Transforms</p>
      <h2>Featured products from the Recanto 2026 collection.</h2>
      <p>
        A focused selection from the current catalog, chosen for warmth, material balance,
        and the kind of visual clarity that helps a project feel settled.
      </p>
    </div>

    <div class="container products-grid home-feature-grid">
      <article v-for="product in featuredProducts" :key="product.slug" class="home-feature-card reveal">
        <RouterLink :to="`/products/${product.slug}`" class="home-feature-link">
          <img :src="product.image" :alt="product.name" loading="lazy" />
          <div>
            <p class="eyebrow">{{ product.category }}</p>
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
          </div>
        </RouterLink>
      </article>
    </div>
  </section>

  <section class="section">
    <div class="container split-section reveal" style="--delay: 0.1s">
      <div class="split-copy">
        <p class="eyebrow">Duratex You</p>
        <h2>Custom directions that feel made for the room, not just specified into it.</h2>
        <p>
          These are the patterns and tones that give a space its own voice. Some are quieter,
          some more expressive, but all of them aim to feel intentional and usable in real projects.
        </p>
        <div class="hero-actions">
          <RouterLink class="button" to="/products">Explore the catalog</RouterLink>
          <RouterLink class="button ghost" to="/contact">Request support</RouterLink>
        </div>
      </div>

      <div class="story-grid">
        <article v-for="story in designStories" :key="story.title" class="story-card">
          <img :src="story.image" :alt="story.title" loading="lazy" />
          <div>
            <h3>{{ story.title }}</h3>
            <p>{{ story.description }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container section-heading reveal" style="--delay: 0.08s">
      <p class="eyebrow">Know the Difference</p>
      <h2>MDF and MDP, explained in a way that actually helps projects move.</h2>
      <p>
        A practical comparison of the main board types, with enough detail for designers,
        contractors, and clients to understand what fits where.
      </p>
    </div>

    <div class="container board-grid">
      <article v-for="panel in panelTypes" :key="panel.title" class="board-card reveal">
        <img :src="panel.image" :alt="panel.title" loading="lazy" />
        <div>
          <p class="eyebrow">{{ panel.subtitle }}</p>
          <h3>{{ panel.title }}</h3>
          <p>{{ panel.description }}</p>
        </div>
      </article>
    </div>

    <div class="container compare-card reveal" style="--delay: 0.12s">
      <div class="compare-summary">
        <p class="compare-title">MDF vs MDP</p>
        <h3>Choose by real use, not by label.</h3>
        <p>
          MDF gives smoother finishing and cleaner detailing. MDP performs with strong
          structural stability on straight spans. For projects with stricter constraints,
          MDF Fire and Ultra Premium cover the safety and moisture scenarios.
        </p>
        <RouterLink class="button" to="/contact">Ask for specification support</RouterLink>
      </div>
      <div class="compare-points compare-points-redesign">
        <div>
          <span>MDF</span>
          <p>Smoother edge quality for curves, routed details, furniture fronts, and doors.</p>
        </div>
        <div>
          <span>MDP</span>
          <p>More stable for shelving, cabinet structures, and longer straight components.</p>
        </div>
        <div>
          <span>HDF</span>
          <p>Higher density for specialized technical applications and demanding overlays.</p>
        </div>
      </div>
    </div>

    <div class="container compare-matrix reveal" style="--delay: 0.16s">
      <article>
        <p class="eyebrow">Best fit</p>
        <h3>Where MDF leads</h3>
        <p>
          Internal doors, carved fronts, decorative components, and projects where finish quality
          and machining precision are the priority.
        </p>
      </article>
      <article>
        <p class="eyebrow">Best fit</p>
        <h3>Where MDP leads</h3>
        <p>
          Structural carcasses, horizontal spans, high-repeat furniture runs, and cost-conscious
          production with consistent stability.
        </p>
      </article>
      <article>
        <p class="eyebrow">Project cue</p>
        <h3>Need support selecting?</h3>
        <p>
          Share use-case, moisture exposure, and machining requirements. Our team maps the board,
          finish, and pattern combination clearly.
        </p>
        <RouterLink class="text-link" to="/contact">Talk to Duratex technical team</RouterLink>
      </article>
    </div>
  </section>
 
  <section class="section compact">
    <div class="container cta-panel cta-panel-redesign reveal" style="--delay: 0.1s">
      <div class="cta-panel-copy">
        <p class="eyebrow">Contact</p>
        <h2>Bring your brief, timeline, and constraints. We will help shape the right material path.</h2>
        <p>
          From early mood direction to final board specification, get practical guidance built
          around how the project will actually be delivered.
        </p>
      </div>
      <div class="cta-panel-actions">
        <RouterLink class="button" to="/contact">Start a project conversation</RouterLink>
        <RouterLink class="button ghost" to="/products">View full product range</RouterLink>
      </div>
      <div class="cta-panel-note">
        <span>Fast track:</span>
        <p>Share drawings, BOQ, or mood references and we will reply with a focused recommendation.</p>
      </div>
    </div>
  </section>
</template>
