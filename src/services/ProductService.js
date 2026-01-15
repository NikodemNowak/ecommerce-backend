import Product from '../models/Product.js'
import bookshelf from '../db/index.js'
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError.js'

class ProductService {
  async getAll() {
    return Product.fetchAll({ withRelated: ['category'] })
  }

  async getById(id) {
    const product = await Product.where({ id })
      .fetch({ withRelated: ['category'] })
      .catch(() => null)

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    return product
  }

  async create(data) {
    const payload = this._validateProductPayload(data)
    return Product.forge(payload).save()
  }

  async update(id, data) {
    const product = await this.getById(id)
    const payload = this._validateProductPayload(data)
    return product.save(payload)
  }

  async initializeProducts(records) {
    if (!Array.isArray(records) || !records.length) {
      throw new BadRequestError('No product records supplied')
    }

    const existingCountRow = await bookshelf.knex('products').count('id as count').first()
    const existingCount = Number(existingCountRow?.count ?? 0)

    if (existingCount > 0) {
      throw new ConflictError('Products are already initialized')
    }

    const normalized = records.map((record, index) => {
      try {
        return this._validateProductPayload(record)
      } catch (error) {
        if (error instanceof BadRequestError) {
          throw new BadRequestError(`Row ${index + 1}: ${error.message}`)
        }
        throw error
      }
    })

    await bookshelf.transaction(async (trx) => {
      for (const payload of normalized) {
        await Product.forge(payload).save(null, { transacting: trx })
      }
    })

    return normalized.length
  }

  _validateProductPayload(data, options = {}) {
    const { requireAllFields = true } = options

    if (!data || typeof data !== 'object') {
      throw new BadRequestError('Product payload must be a valid object')
    }

    const normalized = {}
    const providedFields = new Set(Object.keys(data))
    const allowedFields = ['name', 'description', 'price', 'weight', 'category_id', 'categoryId']

    if (!requireAllFields && !allowedFields.some((field) => providedFields.has(field))) {
      throw new BadRequestError('At least one updatable product field must be provided')
    }

    const nameValue = this._pickValue(data, 'name')
    if (nameValue.present || requireAllFields) {
      const name = this._ensureNonEmptyString(nameValue.value, 'Product name')
      normalized.name = name
    }

    const descriptionValue = this._pickValue(data, 'description')
    if (descriptionValue.present || requireAllFields) {
      const description = this._ensureNonEmptyString(descriptionValue.value, 'Product description')
      normalized.description = description
    }

    const priceValue = this._pickValue(data, 'price')
    if (priceValue.present || requireAllFields) {
      normalized.price = this._ensurePositiveNumber(priceValue.value, 'Product price')
    }

    const weightValue = this._pickValue(data, 'weight')
    if (weightValue.present || requireAllFields) {
      normalized.weight = this._ensurePositiveNumber(weightValue.value, 'Product weight')
    }

    const categoryValue = this._pickValue(data, 'category_id', 'categoryId')
    if (categoryValue.present || requireAllFields) {
      normalized.category_id = this._ensurePositiveInteger(
        categoryValue.value,
        'Product category ID'
      )
    }

    const requiredFields = ['name', 'description', 'price', 'weight', 'category_id']
    if (requireAllFields) {
      const missing = requiredFields.filter((field) => normalized[field] === undefined)
      if (missing.length) {
        throw new BadRequestError(`Missing required product fields: ${missing.join(', ')}`)
      }
    }

    if (!Object.keys(normalized).length) {
      throw new BadRequestError('No valid product fields supplied')
    }

    return normalized
  }

  _pickValue(source, ...keys) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        return { value: source[key], present: true }
      }
    }
    return { value: undefined, present: false }
  }

  _ensureNonEmptyString(value, label) {
    if (value === undefined || value === null) {
      throw new BadRequestError(`${label} cannot be empty`)
    }

    const normalized = value.toString().trim()
    if (!normalized) {
      throw new BadRequestError(`${label} cannot be empty`)
    }

    return normalized
  }

  _ensurePositiveNumber(value, label) {
    const asNumber = Number(value)
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      throw new BadRequestError(`${label} must be a positive number`)
    }
    return asNumber
  }

  _ensurePositiveInteger(value, label) {
    const asNumber = Number(value)
    if (!Number.isInteger(asNumber) || asNumber <= 0) {
      throw new BadRequestError(`${label} must be a positive integer`)
    }
    return asNumber
  }

  async generateSeoDescription(id) {
    const GROQ_KEY = process.env.GROQ_API_KEY || ''

    if (!GROQ_KEY) {
      throw new BadRequestError('GROQ API key is not configured')
    }

    const product = await this.getById(id)

    const name = product.get('name')
    const description = product.get('description')
    const price = product.get('price')
    const weight = product.get('weight')

    const body = {
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś specjalistą od SEO i marketingu. Twórz zwięzły, profesjonalny opis produktu w języku polskim. Używaj wyłącznie prostego HTML bez znaczników <html>, <head>, <body>. Dozwolone tagi: <p>, <strong>, <em>, <br>. Nie używaj <ul>, <li>, <h1>, <h2>, <h3>, <section>, <main>.',
        },
        {
          role: 'user',
          content: `
Napisz krótki, profesjonalny opis SEO produktu (maksymalnie 2-3 akapity).

Produkt: ${name}
Obecny opis: ${description}
Cena: ${price} zł
Waga: ${weight} kg

Wymagania:
- Język: polski
- Format: prosty HTML (tylko <p>, <strong>, <em>, <br>)
- Styl: profesjonalny, marketingowy, zachęcający do zakupu
- Długość: maksymalnie 3 krótkie akapity
- Nie wymyślaj informacji których nie ma w danych produktu
- Nie używaj list (<ul>, <li>), nagłówków ani section/main
          `.trim(),
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`)
      }

      const data = await response.json()
      const seoDescription = data.choices[0]?.message?.content?.trim()

      if (!seoDescription) {
        throw new Error('No SEO description generated')
      }

      return seoDescription
    } catch (error) {
      throw new BadRequestError(`Failed to generate SEO description: ${error.message}`)
    }
  }
}

export default new ProductService()
