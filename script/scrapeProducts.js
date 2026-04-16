import axios from 'axios'
import { load } from 'cheerio'
import fs from 'fs/promises'
import path from 'path'

const baseUrl = 'https://www.duratex.com.br/produtos'
const outputPath = path.resolve(process.cwd(), 'src/data/products.json')
const imagesDir = path.resolve(process.cwd(), 'public/products')

const stripDiacritics = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const sanitizeName = (value) =>
  stripDiacritics(value)
    .replace(/[\u2013\u2014\u2212\u0096]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const cleanText = (value) =>
  (value || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()

const slugify = (value) =>
  sanitizeName(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const isPrimaryImage = (src, alt) => {
  if (!src) return false
  if (!src.includes('duratex-site-strapi')) return false
  if (/(ultra_premium|fire_red)/i.test(src)) return false
  const altLower = (alt || '').toLowerCase()
  if (altLower.includes('ultra premium') || altLower.includes('fire')) return false
  return true
}

const fetchPageHtml = async (page) => {
  const url = `${baseUrl}?page=${page}`
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 20000
  })
  return response.data
}

const fetchProductHtml = async (url) => {
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 20000
  })
  return response.data
}

const extractProductMeta = ($) => {
  const description = cleanText($('h2').first().nextAll('p').first().text())

  const lineLink = $('a[href*="/linha-"]').first().text()
  const categoryFromLine = cleanText(lineLink)

  const headingLabel = $('h4')
    .filter((_, el) => cleanText($(el).text()).toLowerCase() === 'padronagem/desenho')
    .first()
  const categoryFromPattern = cleanText(headingLabel.next('p').text())

  const category = categoryFromLine || categoryFromPattern || 'General Collection'

  return {
    description,
    category
  }
}

const findTotalPages = ($) => {
  let maxPage = 1
  $('a[href*="page="]').each((_, link) => {
    const href = $(link).attr('href')
    if (!href) return
    try {
      const url = new URL(href, baseUrl)
      const page = Number(url.searchParams.get('page'))
      if (!Number.isNaN(page)) {
        maxPage = Math.max(maxPage, page)
      }
    } catch {
      // Ignore parse errors.
    }
  })

  const text = $('body').text()
  const match = text.match(/\b\d+\s*\/\s*(\d+)\b/)
  if (match) {
    const total = Number(match[1])
    if (!Number.isNaN(total)) {
      maxPage = Math.max(maxPage, total)
    }
  }

  return maxPage
}

const extractProducts = ($) => {
  const products = []
  $('a[href*="/produtos/"]').each((_, link) => {
    const label = $(link).text().toLowerCase()
    if (!label.includes('ver produto')) return

    const href = $(link).attr('href')
    if (!href) return

    const container = $(link)
      .parents()
      .filter((_, node) => $(node).find('img').length > 0)
      .first()

    const images = container.find('img')
    let imageUrl = ''
    let name = ''

    images.each((_, img) => {
      const src =
        $(img).attr('src') ||
        $(img).attr('data-src') ||
        $(img).attr('data-lazy-src')
      const alt = $(img).attr('alt')?.trim()
      if (!src || !alt) return
      if (!isPrimaryImage(src, alt)) return
      imageUrl = src
      name = alt
      return false
    })

    if (!imageUrl || !name) return

    const cleanedName = sanitizeName(name)
    const slug = slugify(href.split('/').filter(Boolean).pop() || cleanedName)
    const productUrl = new URL(href, baseUrl).href

    products.push({ name: cleanedName, slug, imageUrl, productUrl })
  })

  return products
}

const downloadImage = async (imageUrl, slug) => {
  const url = new URL(imageUrl)
  const ext = path.extname(url.pathname) || '.jpg'
  const filename = `${slug}${ext}`
  const destination = path.join(imagesDir, filename)

  try {
    await fs.access(destination)
    return filename
  } catch {
    // Continue to download if missing.
  }

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 })
  await fs.writeFile(destination, response.data)
  return filename
}

const run = async () => {
  await fs.mkdir(imagesDir, { recursive: true })

  const firstHtml = await fetchPageHtml(1)
  const $first = load(firstHtml)
  const detectedPages = findTotalPages($first)

  const productMap = new Map()
  const addProducts = (items) => {
    items.forEach((item) => {
      if (!productMap.has(item.productUrl)) {
        productMap.set(item.productUrl, item)
      }
    })
  }

  const firstItems = extractProducts($first)
  addProducts(firstItems)
  console.log(`Page 1: ${firstItems.length} items, ${productMap.size} total`)

  const maxPages = Math.max(detectedPages, 12)
  console.log(`Detected pages: ${detectedPages}. Scanning up to ${maxPages}.`)
  let consecutiveEmpty = 0

  for (let page = 2; page <= maxPages && consecutiveEmpty < 2; page += 1) {
    const html = await fetchPageHtml(page)
    const $page = load(html)
    const items = extractProducts($page)
    const beforeCount = productMap.size
    addProducts(items)
    const addedCount = productMap.size - beforeCount
    console.log(`Page ${page}: ${items.length} items, ${addedCount} new`)
    if (items.length === 0 || addedCount === 0) {
      consecutiveEmpty += 1
    } else {
      consecutiveEmpty = 0
    }
  }

  const output = []
  for (const item of productMap.values()) {
    let image = item.imageUrl
    let category = 'General Collection'
    let description = ''

    try {
      const localImage = await downloadImage(item.imageUrl, item.slug)
      image = `/products/${localImage}`
    } catch (error) {
      console.warn(`Failed to download ${item.imageUrl}:`, error.message)
    }

    try {
      const detailHtml = await fetchProductHtml(item.productUrl)
      const $detail = load(detailHtml)
      const details = extractProductMeta($detail)
      category = details.category
      description = details.description
    } catch (error) {
      console.warn(`Failed to extract details for ${item.productUrl}:`, error.message)
    }

    output.push({
      name: item.name,
      slug: item.slug,
      image,
      category,
      description
    })
  }

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2))
  console.log(`Saved ${output.length} products to ${outputPath}`)
}

run().catch((error) => {
  console.error('Scrape failed:', error)
  process.exit(1)
})
