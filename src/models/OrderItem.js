import bookshelf from '../db/index.js'

const OrderItem = bookshelf.model('OrderItem', {
  tableName: 'order_items',
  order() {
    return this.belongsTo('Order', 'order_id')
  },
  product() {
    return this.belongsTo('Product', 'product_id')
  },
  hasTimestamps: true,
})

export default OrderItem
