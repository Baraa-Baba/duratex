import axios from 'axios'
import { load } from 'cheerio'
import fs from 'fs/promises'
import path from 'path'

const baseUrl = 'https://www.duratex.com.br/produtos'
const outputPath = path.resolve(process.cwd(), 'src/data/products.json')
const assetHost = 'https://duratex-site-strapi.prd.cloud.dex.co/assets/'
const detailImagePreference = 'ambiente'
const detailFetchDelayMs = 400

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const stripDiacritics = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const normalizeForMatch = (value) =>
  stripDiacritics(String(value || '')).toLowerCase()

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

const normalizeUrl = (value, base = baseUrl) => {
  if (!value) return ''
  try {
    return new URL(value, base).href
  } catch {
    return value
  }
}

const resolveSliderImageUrl = (download, preview) => {
  const normalizedDownload = normalizeUrl(download, baseUrl)
  const normalizedPreview = normalizeUrl(preview, baseUrl)
  const downloadIsAsset = normalizedDownload.startsWith(assetHost)
  const previewIsAsset = normalizedPreview.startsWith(assetHost)

  if (downloadIsAsset && !/\.(tif|tiff)(\?|$)/i.test(normalizedDownload)) {
    return normalizedDownload
  }

  if (previewIsAsset) {
    return normalizedPreview
  }

  if (downloadIsAsset) {
    return normalizedDownload
  }

  return normalizedPreview || normalizedDownload || ''
}

const collectSliderImages = ($) => {
  const images = []
  const seen = new Set()

  $('a[href*="download?url="]').each((_, link) => {
    let download = ''
    const href = $(link).attr('href')
    if (href) {
      try {
        const url = new URL(href, baseUrl)
        const target = url.searchParams.get('url')
        if (target) {
          download = decodeURIComponent(target)
        }
      } catch {
        // Ignore malformed URLs.
      }
    }

    const parent = $(link).parent()
    const img = parent.find('img').first()
    const preview =
      img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || ''

    const candidate = resolveSliderImageUrl(download, preview)
    if (!candidate || !candidate.startsWith(assetHost)) return
    if (isIgnoredAsset(candidate)) return
    if (seen.has(candidate)) return
    seen.add(candidate)
    images.push(candidate)
  })

  return images
}

const extractSrcsetUrls = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim().split(' ')[0])
    .filter(Boolean)

const stopwordTokens = new Set([
  'linha',
  'line',
  'mdf',
  'mdp',
  'bp',
  'cristallo',
  'essential',
  'essencial',
  'acetinatta',
  'acatinatta',
  'acetinado',
  'trama',
  'plot',
  'sense',
  'design',
  'prism',
  'velluto',
  'original',
  'woody',
  'concept',
  'thera',
  'general',
  'collection'
])

const buildSlugTokens = (slug) => {
  const baseTokens = (slug || '')
    .toLowerCase()
    .split('-')
    .filter(Boolean)

  const filtered = baseTokens.filter(
    (token) => token.length >= 3 && !stopwordTokens.has(token)
  )

  return filtered.length ? filtered : baseTokens.filter((token) => token.length >= 3)
}

const buildNameTokens = (name) => {
  const normalized = normalizeForMatch(name)
  const baseTokens = normalized
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

  const filtered = baseTokens.filter(
    (token) => token.length >= 3 && !stopwordTokens.has(token)
  )

  return filtered.length ? filtered : baseTokens.filter((token) => token.length >= 3)
}

const ignoredAssetTokens = [
  'onde_encontrar',
  'menu-image',
  'menu_image',
  'logo',
  'icone',
  'icon',
  'card_icone',
  'card_icones',
  'catalogo',
  'catalog'
]

const isIgnoredAsset = (url) => {
  const normalized = normalizeForMatch(url)
  return ignoredAssetTokens.some((token) => normalized.includes(token))
}

const isPadraoAsset = (url) => {
  const normalized = normalizeForMatch(url)
  return normalized.includes('padrao') || normalized.includes('padronagem')
}

const roomTokens = [
  'ambiente',
  'ambientes',
  'sala',
  'cozinha',
  'quarto',
  'dormitorio',
  'lavabo',
  'banheiro',
  'escritorio',
  'closet',
  'home',
  'suite'
]

const isAmbienteAsset = (url) => {
  const normalized = normalizeForMatch(url)
  return roomTokens.some((token) => normalized.includes(token))
}

const hasAmbienteUrlHint = (url) => {
  const normalized = normalizeForMatch(url)
  return (
    isAmbienteAsset(normalized) ||
    normalized.includes('bp_') ||
    normalized.includes('bp-')
  )
}

const countTokenMatches = (normalized, tokens) =>
  tokens.reduce((total, token) => (normalized.includes(token) ? total + 1 : total), 0)

const passesTokenThreshold = (matchCount, tokenCount) => {
  if (tokenCount >= 2) return matchCount >= 2
  return matchCount >= 1
}

const collectDetailImageCandidates = ($) => {
  const candidates = new Map()
  const addCandidate = (value, weight, preview, source) => {
    const normalized = normalizeUrl(value, baseUrl)
    if (!normalized) return
    const current = candidates.get(normalized)
    const nextWeight = Math.max(current?.weight || 0, weight)
    const nextPreview = preview || current?.preview || ''
    const nextIsDownload = current?.isDownload || source === 'download'

    candidates.set(normalized, {
      url: normalized,
      weight: nextWeight,
      preview: nextPreview,
      isDownload: nextIsDownload
    })
  }

  $('a[href*="download?url="]').each((_, link) => {
    const href = $(link).attr('href')
    if (!href) return
    try {
      const url = new URL(href, baseUrl)
      const target = url.searchParams.get('url')
      if (!target) return
      const decoded = decodeURIComponent(target)
      if (!decoded) return

      const parent = $(link).parent()
      const img = parent.find('img').first()
      const preview =
        img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || ''

      addCandidate(decoded, 120, preview, 'download')
    } catch {
      // Ignore malformed URLs.
    }
  })

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, meta) => {
    const content = $(meta).attr('content')
    if (content) addCandidate(content, 30, '', 'meta')
  })

  $('img').each((_, img) => {
    const src =
      $(img).attr('src') ||
      $(img).attr('data-src') ||
      $(img).attr('data-lazy-src')
    if (src) addCandidate(src, 20, '', 'img')

    const srcset = $(img).attr('srcset') || $(img).attr('data-srcset')
    extractSrcsetUrls(srcset).forEach((entry) => addCandidate(entry, 15, '', 'srcset'))
  })

  $('source').each((_, source) => {
    const srcset = $(source).attr('srcset') || $(source).attr('data-srcset')
    extractSrcsetUrls(srcset).forEach((entry) => addCandidate(entry, 15, '', 'srcset'))
  })

  return Array.from(candidates.values())
}

const scoreDetailImageUrl = (url) => {
  const lower = url.toLowerCase()
  const normalized = normalizeForMatch(url)
  if (/\.(tif|tiff)(\?|$)/.test(lower)) return -Infinity
  if (!lower.includes('duratex-site-strapi')) return -Infinity
  if (isIgnoredAsset(normalized)) {
    if (!(detailImagePreference === 'ambiente' && hasAmbienteUrlHint(url))) {
      return -Infinity
    }
  }

  let score = 0

  if (detailImagePreference === 'ambiente') {
    if (isAmbienteAsset(normalized)) score += 80
    if (normalized.includes('mood')) score -= 40
    if (normalized.includes('padrao') || normalized.includes('padronagem')) score -= 80
    if (normalized.includes('objeto') || normalized.includes('objetos')) score -= 20
  } else if (normalized.includes('padrao') || normalized.includes('padronagem')) {
    score += 200
  }

  if (normalized.includes('mood')) score += 5
  if (normalized.includes('objeto') || normalized.includes('objetos')) score += 5
  if (normalized.includes('slide')) score += 5

  if (
    lower.includes('590x370') ||
    lower.includes('507x375') ||
    lower.includes('212x162') ||
    lower.includes('162x162') ||
    lower.includes('144x129') ||
    lower.includes('114x129') ||
    lower.includes('thumb')
  ) {
    score -= 40
  }

  const pxMatch = lower.match(/(\d{3,4})px/)
  if (pxMatch) {
    score += Math.min(Number(pxMatch[1]) / 100, 40)
  }

  const dimensionMatch = lower.match(/(\d{2,4})x(\d{2,4})/)
  if (dimensionMatch) {
    const width = Number(dimensionMatch[1])
    const height = Number(dimensionMatch[2])
    if (Number.isFinite(width) && Number.isFinite(height)) {
      score += Math.min((width * height) / 100000, 40)
    }
  }

  if (/\.(webp|jpe?g|png)(\?|$)/.test(lower)) {
    score += 6
  }

  return score
}

const pickBestDetailImage = (items, slug, name) => {
  const candidates = items
    .map(({ url, weight, preview, isDownload }) => ({
      url: normalizeUrl(url, baseUrl),
      weight,
      preview: preview ? normalizeUrl(preview, baseUrl) : '',
      isDownload: Boolean(isDownload)
    }))
    .filter(({ url }) => url && url.startsWith(assetHost))

  const downloadCandidates = candidates.filter((candidate) => candidate.isDownload)
  const scopedCandidates = downloadCandidates.length ? downloadCandidates : candidates

  if (!candidates.length) return ''

  const tokens = Array.from(new Set([...buildSlugTokens(slug), ...buildNameTokens(name)]))
  const tokenMatches = tokens.length
    ? scopedCandidates.filter(({ url, preview }) => {
        const normalized = normalizeForMatch(`${preview} ${url}`)
        const matchCount = countTokenMatches(normalized, tokens)
        return passesTokenThreshold(matchCount, tokens.length)
      })
    : []

  const scopedForType = tokenMatches.length ? tokenMatches : scopedCandidates
  const ambienteMatches =
    detailImagePreference === 'ambiente'
      ? (() => {
          const ambienteUrlMatches = scopedForType.filter(({ url }) =>
            hasAmbienteUrlHint(url)
          )
          const ambientePool = ambienteUrlMatches.length
            ? ambienteUrlMatches
            : scopedForType

          return ambientePool.filter(({ url, preview }) => {
            const normalized = normalizeForMatch(preview || url)
            const urlHasAmbienteHint = hasAmbienteUrlHint(url)
            const isExcluded =
              isPadraoAsset(normalized) ||
              normalized.includes('mood') ||
              normalized.includes('objeto') ||
              normalized.includes('objetos')

            return urlHasAmbienteHint ? true : !isExcluded
          })
        })()
      : scopedForType.filter(({ url }) => isPadraoAsset(url))

  if (!ambienteMatches.length) return ''

  const ranked = ambienteMatches
    .map(({ url, weight, preview }) => {
      const normalized = normalizeForMatch(`${preview} ${url}`)
      const previewNormalized = normalizeForMatch(preview || url)
      const tokenMatchCount = tokens.length ? countTokenMatches(normalized, tokens) : 0
      const ambienteBoost = isAmbienteAsset(previewNormalized) ? 80 : 0
      const ambienteUrlBoost = hasAmbienteUrlHint(url) ? 40 : 0
      const isTif = /\.(tif|tiff)(\?|$)/i.test(url)
      const baseScore = isTif ? 0 : scoreDetailImageUrl(url)

      if (!Number.isFinite(baseScore)) return null

      return {
        url,
        preview,
        isTif,
        score:
          baseScore +
          tokenMatchCount * 30 +
          weight +
          ambienteBoost +
          ambienteUrlBoost
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (!best) return ''

  if (best.isTif && best.preview) {
    return best.preview
  }

  return best.url
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

const extractProductMeta = ($, slug, name) => {
  const description = cleanText($('h2').first().nextAll('p').first().text())

  const lineLink = $('a[href*="/linha-"]').first().text()
  const categoryFromLine = cleanText(lineLink)

  const headingLabel = $('h4')
    .filter((_, el) => cleanText($(el).text()).toLowerCase() === 'padronagem/desenho')
    .first()
  const categoryFromPattern = cleanText(headingLabel.next('p').text())

  const category = categoryFromLine || categoryFromPattern || 'General Collection'

  const sliderImages = collectSliderImages($)
  const detailCandidates = collectDetailImageCandidates($)
  const fallbackDetail = pickBestDetailImage(detailCandidates, slug, name)
  const detailImages = sliderImages.length
    ? sliderImages
    : fallbackDetail
      ? [fallbackDetail]
      : []

  return {
    description,
    category,
    detailImages
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
      imageUrl = normalizeUrl(src, baseUrl)
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

const run = async () => {
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
  let isFirstDetail = true
  for (const item of productMap.values()) {
    let image = item.imageUrl
    let category = 'General Collection'
    let description = ''
    let imageDetail = []

    try {
      if (!isFirstDetail) {
        await delay(detailFetchDelayMs)
      }
      isFirstDetail = false
      const detailHtml = await fetchProductHtml(item.productUrl)
      const $detail = load(detailHtml)
      const details = extractProductMeta($detail, item.slug, item.name)
      category = details.category
      description = details.description
      imageDetail = details.detailImages
    } catch (error) {
      console.warn(`Failed to extract details for ${item.productUrl}:`, error.message)
    }

    const resolvedDetailImages = imageDetail?.length ? imageDetail : [image]

    output.push({
      name: item.name,
      slug: item.slug,
      image,
      imageDetail: resolvedDetailImages,
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
