<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import products from '../data/products.json'

const catalogUrl = '/catalog.pdf'

type Product = {
  name: string
  slug: string
  image: string
  category?: string
  description?: string
}

const searchTerm = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = 24

const allProducts = products as Product[]

const categories = computed(() => {
  const set = new Set<string>()
  allProducts.forEach((product) => {
    if (product.category) {
      set.add(product.category)
    }
  })
  return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
})

const filteredProducts = computed(() => {
  const normalizedTerm = searchTerm.value.trim().toLowerCase()

  return allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'all' || product.category === selectedCategory.value
    const matchesSearch =
      normalizedTerm.length === 0 ||
      product.name.toLowerCase().includes(normalizedTerm) ||
      (product.description || '').toLowerCase().includes(normalizedTerm)

    return matchesCategory && matchesSearch
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / pageSize))
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1)
)

watch([searchTerm, selectedCategory], () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) {
    currentPage.value = nextTotal
  }
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<template>
  <section id="catalog" class="section compact">
    <div class="container products-container page-hero reveal" style="--delay: 0.05s"> 
      <div class="page-hero-head">
        <h1>Our Products</h1>
        <a class="button catalog-top-link" :href="catalogUrl" target="_blank" rel="noreferrer">
          View catalog
        </a>
      </div> 
      <div class="shop-tools">
        <label class="sr-only" for="product-search">Search products</label>
        <input
          id="product-search"
          v-model="searchTerm"
          type="search"
          placeholder="Search by name or mood"
        />

        <label class="sr-only" for="product-filter">Filter by category</label>
        <select id="product-filter" v-model="selectedCategory">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category === 'all' ? 'All categories' : category }}
          </option>
        </select>

        <div class="shop-count" aria-live="polite">
          <span>{{ filteredProducts.length }}</span>
          <p>matching products</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container products-container products-grid">
      <article
        v-for="product in paginatedProducts"
        :key="product.slug"
        class="product-card-minimal reveal"
        style="--delay: 0.08s"
      >
        <RouterLink :to="`/products/${product.slug}`" class="product-thumb-link">
          <img :src="product.image" :alt="product.name" loading="lazy" />
          <div>
            <h3>{{ product.name }}</h3>
            <p v-if="product.category" class="product-meta">{{ product.category }}</p>
          </div>
        </RouterLink>
      </article>

      <p v-if="filteredProducts.length === 0" class="empty-state">
        No products match your search and filter.
      </p>
    </div>

    <div v-if="filteredProducts.length > pageSize" class="container products-container pagination-wrap">
      <nav class="pagination" aria-label="Products pagination">
        <button
          type="button"
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="pagination-button"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </nav>
    </div>
  </section>
</template>
