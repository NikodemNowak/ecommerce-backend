import Product from '../models/Product.js'

class ProductService {
  async getAll() {
    return Product.fetchAll({ withRelated: ['category'] })
  }

  async getById(id) {
    const product = await Product.where({ id })
      .fetch({ withRelated: ['category'] })
      .catch(() => null)

    if (!product) {
      throw new Error('Not found')
    }

    return product
  }

  async create(data) {
    return Product.forge(data).save()
  }

  async update(id, data) {
    const product = await this.getById(id)
    return product.save(data, { patch: true })
  }

  async delete(id) {
    const product = await this.getById(id)
    await product.destroy()
  }
}

export default new ProductService()
