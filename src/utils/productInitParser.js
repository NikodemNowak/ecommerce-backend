import { parse as parseCsv } from 'csv-parse/sync'
import { BadRequestError } from '../errors/AppError.js'

const JSON_MIME_HINTS = new Set(['application/json', 'text/json', 'application/x-json'])
const CSV_MIME_HINTS = new Set(['text/csv', 'application/vnd.ms-excel'])

function guessFormat(file) {
  const extension = file.originalname?.split('.').pop()?.toLowerCase()
  if (extension === 'json') {
    return 'json'
  }
  if (extension === 'csv') {
    return 'csv'
  }

  if (file.mimetype && JSON_MIME_HINTS.has(file.mimetype)) {
    return 'json'
  }
  if (file.mimetype && CSV_MIME_HINTS.has(file.mimetype)) {
    return 'csv'
  }

  return 'unknown'
}

function parseJsonContent(content) {
  try {
    const parsed = JSON.parse(content)
    return normalizeProductsPayload(parsed)
  } catch (error) {
    throw new BadRequestError(`Invalid JSON file: ${error.message}`)
  }
}

function parseCsvContent(content) {
  try {
    const rows = parseCsv(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (!rows.length) {
      throw new BadRequestError('CSV file does not contain any rows')
    }

    const normalizedRows = rows.map((row) =>
      Object.entries(row).reduce((acc, [key, value]) => {
        if (!key) {
          return acc
        }
        const normalizedKey = key.trim()
        if (!normalizedKey) {
          return acc
        }
        const normalizedValue = typeof value === 'string' ? value.trim() : value
        acc[normalizedKey] = normalizedValue
        return acc
      }, {})
    )

    return normalizeProductsPayload(normalizedRows)
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error
    }
    throw new BadRequestError(`Invalid CSV file: ${error.message}`)
  }
}

export function parseProductsFromUpload(file) {
  if (!file) {
    throw new BadRequestError('Upload file with product data using "file" field')
  }

  const buffer = file.buffer
  if (!buffer || !buffer.length) {
    throw new BadRequestError('Uploaded file is empty')
  }

  const content = buffer.toString('utf-8').trim()
  if (!content) {
    throw new BadRequestError('Uploaded file is empty')
  }

  const format = guessFormat(file)

  if (format === 'json') {
    return parseJsonContent(content)
  }
  if (format === 'csv') {
    return parseCsvContent(content)
  }

  try {
    return parseJsonContent(content)
  } catch (jsonError) {
    if (
      jsonError instanceof BadRequestError &&
      !jsonError.message.startsWith('Invalid JSON file')
    ) {
      throw jsonError
    }
    return parseCsvContent(content)
  }
}

export function normalizeProductsPayload(payload) {
  if (!Array.isArray(payload) || !payload.length) {
    throw new BadRequestError('Products payload must be a non-empty array')
  }

  return payload.map((record, index) => {
    if (!record || typeof record !== 'object') {
      throw new BadRequestError(`Row ${index + 1}: Product record must be an object`)
    }
    return record
  })
}
