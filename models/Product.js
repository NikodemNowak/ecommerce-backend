const bookshelf = require("../db");
const Category = require("./Category");

const Product = bookshelf.model("Product", {
  tableName: "products",
  category() {
    return this.belongsTo("Category", "category_id");
  },
  orderItems() {
    return this.hasMany("OrderItem", "product_id");
  },
  hasTimestamps: true,
});

module.exports = Product;
