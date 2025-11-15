import bookshelf from '../db/index.js'

const Product = bookshelf.model('Product', {
  tableName: 'products',
  category() {
    return this.belongsTo('Category', 'category_id')
  },
  orderItems() {
    return this.hasMany('OrderItem', 'product_id')
  },
  hasTimestamps: true,
})

export default Product
