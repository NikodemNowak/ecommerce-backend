const bookshelf = require("../db");
const Product = require("./Product");
const Order = require("./Order");

const OrderItem = bookshelf.model("OrderItem", {
  tableName: "order_items",
  order() {
    return this.belongsTo("Order", "order_id");
  },
  product() {
    return this.belongsTo("Product", "product_id");
  },
  hasTimestamps: true,
});

module.exports = OrderItem;
