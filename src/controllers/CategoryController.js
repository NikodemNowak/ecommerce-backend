import categoryService from '../services/CategoryService.js'

export default {
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAll()
      res.json(categories)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },
}
