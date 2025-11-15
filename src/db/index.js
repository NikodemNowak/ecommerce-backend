import knexLib from 'knex'
import bookshelfLib from 'bookshelf'

const knex = knexLib({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce',
  },
})

const bookshelf = bookshelfLib(knex)

export { knex, bookshelf }
export default bookshelf
