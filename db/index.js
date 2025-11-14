const knex = require("knex")({
  client: "mysql2", // lub 'pg' jeśli PostgreSQL
  connection: {
    host: "localhost",
    user: "twoj_user",
    password: "twoje_haslo",
    database: "shop_db",
  },
});

module.exports = knex;
