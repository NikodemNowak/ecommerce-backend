import { StatusCodes } from 'http-status-codes'
import productService from '../services/ProductService.js'
import { handleControllerError } from '../utils/controllerErrorHandler.js'
import { parseProductsFromUpload, normalizeProductsPayload } from '../utils/productInitParser.js'
import { BadRequestError } from '../errors/AppError.js'

export default {
  async getAll(req, res) {
    try {
      const products = await productService.getAll()
      res.json(products)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async getById(req, res) {
    try {
      const product = await productService.getById(req.params.id)
      res.json(product)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async create(req, res) {
    try {
      const product = await productService.create(req.body)
      res.status(StatusCodes.CREATED).json(product)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async update(req, res) {
    try {
      const updated = await productService.update(req.params.id, req.body)
      res.json(updated)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async seoDescription(req, res) {
    try {
      const { id } = req.params
      const seoDesc = await productService.generateSeoDescription(id)
      res.json({ seoDescription: seoDesc })
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async initialize(req, res) {
    try {
      let records

      if (req.file) {
        records = parseProductsFromUpload(req.file)
      } else if (Array.isArray(req.body)) {
        records = normalizeProductsPayload(req.body)
      } else if (Array.isArray(req.body?.products)) {
        records = normalizeProductsPayload(req.body.products)
      } else {
        throw new BadRequestError(
          'Provide product data as a JSON array or upload a JSON/CSV file under the "file" field'
        )
      }

      const count = await productService.initializeProducts(records)

      res.status(StatusCodes.OK).json({
        message: `Successfully initialized ${count} products`,
        count,
      })
    } catch (err) {
      handleControllerError(res, err)
    }
  },
}
