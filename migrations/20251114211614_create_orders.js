export function up(knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary()
    table.timestamp('approved_at').nullable()
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table
      .integer('status_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('statuses')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
    table.timestamps(true, true)
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('orders')
}
