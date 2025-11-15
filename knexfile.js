// Update with your config settings.

/**
 * @type { Record<string, import('knex').Knex.Config> }
 */
const config = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'ecommerce',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  },
}

export default config
