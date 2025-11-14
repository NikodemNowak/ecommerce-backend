exports.up = function (knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.timestamp("approved_at").nullable();
    table
      .integer("status_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("statuses")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
    table.string("user_name").notNullable();
    table.string("email").notNullable();
    table.string("phone").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("orders");
};
