import bookshelf from '../db/index.js'

const Order = bookshelf.model('Order', {
  tableName: 'orders',
  status() {
    return this.belongsTo('Status', 'status_id')
  },
  items() {
    return this.hasMany('OrderItem', 'order_id')
  },
  opinions() {
    return this.hasMany('Opinion', 'order_id')
  },
  user() {
    return this.belongsTo('User', 'user_id')
  },
  hasTimestamps: true,
})

export default Order
