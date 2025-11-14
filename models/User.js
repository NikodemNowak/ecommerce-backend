const bookshelf = require("../db");

const User = bookshelf.model("User", {
  tableName: "users",
  orders() {
    return this.hasMany("Order", "user_id");
  },
  hasTimestamps: true,
});

module.exports = User;
