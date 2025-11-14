const bookshelf = require("../db");

const Status = bookshelf.model("Status", {
  tableName: "statuses",
  orders() {
    return this.hasMany("Order", "status_id");
  },
  hasTimestamps: true,
});

module.exports = Status;
