import bookshelf from '../db/index.js'

const Opinion = bookshelf.model('Opinion', {
  tableName: 'opinions',
  order() {
    return this.belongsTo('Order', 'order_id')
  },
  hasTimestamps: true,
})

export default Opinion
