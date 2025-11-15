export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('username').notNullable().unique()
    table.string('password').notNullable()
    table.string('email').notNullable().unique()
    table.string('role').notNullable().defaultTo('KLIENT')
    table.timestamps(true, true)
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('users')
}
