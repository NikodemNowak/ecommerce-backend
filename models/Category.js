const bookshelf = require("../db");

const Category = bookshelf.model("Category", {
  tableName: "categories",
  products() {
    return this.hasMany("Product", "category_id");
  },
  hasTimestamps: true,
});

module.exports = Category;
