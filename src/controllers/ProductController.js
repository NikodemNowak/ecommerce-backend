import productService from '../services/ProductService.js'

export default {
  async getAll(req, res) {
    try {
      const products = await productService.getAll()
      res.json(products)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },

  async getById(req, res) {
    try {
      const product = await productService.getById(req.params.id)
      res.json(product)
    } catch (err) {
      if (err.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' })
      }
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },

  async create(req, res) {
    try {
      const product = await productService.create(req.body)
      res.status(201).json(product)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },

  async update(req, res) {
    try {
      const updated = await productService.update(req.params.id, req.body)
      res.json(updated)
    } catch (err) {
      if (err.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' })
      }
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },

  async delete(req, res) {
    try {
      await productService.delete(req.params.id)
      res.json({ message: 'Deleted' })
    } catch (err) {
      if (err.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' })
      }
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },
}
