import Category from '../models/Category.js'

class CategoryService {
  async getAll() {
    return Category.fetchAll()
  }
}

export default new CategoryService()
