exports.up = function (knex) {
  return knex.schema.createTable('opinions', (table) => {
    table.increments('id').primary()
    table
      .integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table.integer('rating').notNullable()
    table.text('content').notNullable()
    table.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('opinions')
}
