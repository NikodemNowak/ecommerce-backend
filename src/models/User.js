import bookshelf from '../db/index.js'

const User = bookshelf.model('User', {
  tableName: 'users',
  hidden: ['password'],
  orders() {
    return this.hasMany('Order', 'user_id')
  },
  hasTimestamps: true,
})

export default User
