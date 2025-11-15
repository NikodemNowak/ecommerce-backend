import bookshelf from '../db/index.js'

const Category = bookshelf.model('Category', {
  tableName: 'categories',
  products() {
    return this.hasMany('Product', 'category_id')
  },
  hasTimestamps: true,
})

export default Category
