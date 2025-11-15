import bookshelf from '../db/index.js'

const Status = bookshelf.model('Status', {
  tableName: 'statuses',
  orders() {
    return this.hasMany('Order', 'status_id')
  },
  hasTimestamps: true,
})

export default Status
