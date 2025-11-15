export function up(knex) {
  return knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary()
    table
      .integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table
      .integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
    table.integer('quantity').notNullable()
    table.decimal('unit_price', 12, 2).notNullable()
    table.timestamps(true, true)

    table.unique(['order_id', 'product_id'])
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('order_items')
}
