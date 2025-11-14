const bookshelf = require("../db");
const Status = require("./Status");
const OrderItem = require("./OrderItem");
const Opinion = require("./Opinion");
const User = require("./User");

const Order = bookshelf.model("Order", {
  tableName: "orders",
  status() {
    return this.belongsTo("Status", "status_id");
  },
  items() {
    return this.hasMany("OrderItem", "order_id");
  },
  opinions() {
    return this.hasMany("Opinion", "order_id");
  },
  user() {
    return this.belongsTo("User", "user_id");
  },
  hasTimestamps: true,
});

module.exports = Order;
