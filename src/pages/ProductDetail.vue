<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import products from '../data/products.json'

type Product = {
  name: string
  slug: string
  image: string
  imageDetail?: string[] | string
  category?: string
  description?: string
}

const route = useRoute()

const product = computed(() =>
  (products as Product[]).find((item) => item.slug === String(route.params.slug))
)

const relatedProducts = computed(() => {
  if (!product.value) return []

  return (products as Product[])
    .filter((item) => item.slug !== product.value?.slug)
    .filter((item) =>
      product.value?.category ? item.category === product.value.category : true
    )
    .slice(0, 4)
})

const pageTitle = computed(() => product.value?.name ?? 'Product not found')

const activeSlideIndex = ref(0)
const detailImages = computed(() => {
  if (!product.value) return []
  const raw = product.value.imageDetail
  if (Array.isArray(raw) && raw.length) return raw
  if (typeof raw === 'string' && raw.length) return [raw]
  return product.value.image ? [product.value.image] : []
})

const activeSlide = computed(() => detailImages.value[activeSlideIndex.value] || '')

const setSlide = (index: number) => {
  if (index < 0 || index >= detailImages.value.length) return
  activeSlideIndex.value = index
}

const nextSlide = () => {
  const total = detailImages.value.length
  if (total <= 1) return
  activeSlideIndex.value = (activeSlideIndex.value + 1) % total
}

const prevSlide = () => {
  const total = detailImages.value.length
  if (total <= 1) return
  activeSlideIndex.value = (activeSlideIndex.value - 1 + total) % total
}

watch(product, () => {
  activeSlideIndex.value = 0
})

watch(detailImages, (nextImages) => {
  if (activeSlideIndex.value >= nextImages.length) {
    activeSlideIndex.value = 0
  }
})
</script>

<template>
  <section class="section compact">
    <div class="container product-detail-head reveal" style="--delay: 0.05s">
      <RouterLink class="text-link" to="/products">Back to products</RouterLink>
      <h1>{{ pageTitle }}</h1>
      <p v-if="product?.category" class="product-meta">{{ product.category }}</p>
    </div>
  </section>

  <section class="section" v-if="product">
    <div class="container product-detail-grid">
      <div class="product-detail-media reveal" style="--delay: 0.08s">
        <div class="product-slider" v-if="detailImages.length">
          <div class="product-slider-main">
            <img :src="activeSlide" :alt="product.name" loading="lazy" />
          </div>
          <div class="product-slider-controls" v-if="detailImages.length > 1">
            <button type="button" class="slider-nav" @click="prevSlide">Prev</button>
            <span class="slider-count">
              {{ activeSlideIndex + 1 }} / {{ detailImages.length }}
            </span>
            <button type="button" class="slider-nav" @click="nextSlide">Next</button>
          </div>
          <div class="product-slider-thumbs" v-if="detailImages.length > 1">
            <button
              v-for="(imageUrl, index) in detailImages"
              :key="`${imageUrl}-${index}`"
              type="button"
              class="product-slider-thumb"
              :class="{ active: index === activeSlideIndex }"
              @click="setSlide(index)"
            >
              <img
                :src="imageUrl"
                :alt="`${product.name} view ${index + 1}`"
                loading="lazy"
              />
            </button>
          </div>
        </div>
      </div>
      <article class="product-detail-copy reveal" style="--delay: 0.11s">
        <p class="eyebrow">Surface story</p>
        <h2>{{ product.name }}</h2>
        <p>
          {{
            product.description ||
            'A premium architectural finish from the Duratex collection, selected for modern interiors and long-life performance in custom joinery.'
          }}
        </p>
       </article>
    </div>
  </section>

  <section class="section compact" v-if="product && relatedProducts.length">
    <div class="container reveal" style="--delay: 0.15s">
      <p class="eyebrow">You may also like</p>
      <div class="products-grid products-grid-compact">
        <article v-for="item in relatedProducts" :key="item.slug" class="product-card-minimal">
          <RouterLink :to="`/products/${item.slug}`" class="product-thumb-link">
            <img :src="item.image" :alt="item.name" loading="lazy" />
            <div>
              <h3>{{ item.name }}</h3>
              <p class="product-meta" v-if="item.category">{{ item.category }}</p>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>
  </section>

  <section class="section compact" v-else-if="!product">
    <div class="container reveal" style="--delay: 0.08s">
      <p>The requested product was not found.</p>
      <RouterLink class="button" to="/products">Back to products</RouterLink>
    </div>
  </section>
</template>
