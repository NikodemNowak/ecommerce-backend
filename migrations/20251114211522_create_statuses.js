export function up(knex) {
  return knex.schema.createTable('statuses', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable().unique()
    table.timestamps(true, true)
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('statuses')
}
