import fs from 'fs/promises'
import path from 'path'

const dataPath = path.resolve(process.cwd(), 'src/data/products.json')

const cache = new Map()

const translateText = async (text) => {
  if (!text || !text.trim()) return text

  const key = text.trim()
  if (cache.has(key)) {
    return cache.get(key)
  }

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=' +
    encodeURIComponent(key)

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    const translated = (payload?.[0] || [])
      .map((part) => part?.[0] || '')
      .join('')
      .trim()

    const finalText = translated || key
    cache.set(key, finalText)
    return finalText
  } catch (error) {
    console.warn(`Translation fallback for text: ${key.slice(0, 40)}...`, error.message)
    cache.set(key, key)
    return key
  }
}

const run = async () => {
  const raw = await fs.readFile(dataPath, 'utf-8')
  const products = JSON.parse(raw)

  const translatedProducts = []
  for (const [index, product] of products.entries()) {
    const translatedName = await translateText(product.name)
    const translatedCategory = await translateText(product.category)
    const translatedDescription = await translateText(product.description)

    translatedProducts.push({
      ...product,
      name: translatedName,
      category: translatedCategory,
      description: translatedDescription
    })

    if ((index + 1) % 20 === 0 || index === products.length - 1) {
      console.log(`Translated ${index + 1}/${products.length}`)
    }
  }

  await fs.writeFile(dataPath, `${JSON.stringify(translatedProducts, null, 2)}\n`)
  console.log(`Translated ${translatedProducts.length} products to English.`)
}

run().catch((error) => {
  console.error('Translation failed:', error)
  process.exit(1)
})
