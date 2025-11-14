const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "ecommerce",
  },
});

const bookshelf = require("bookshelf")(knex);
bookshelf.plugin("registry");

module.exports = knex;
module.exports = bookshelf;
