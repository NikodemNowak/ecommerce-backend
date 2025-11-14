const bookshelf = require("../db");
const Order = require("./Order");

const Opinion = bookshelf.model("Opinion", {
  tableName: "opinions",
  order() {
    return this.belongsTo("Order", "order_id");
  },
  hasTimestamps: true,
});

module.exports = Opinion;
