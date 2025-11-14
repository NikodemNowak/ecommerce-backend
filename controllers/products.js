const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Product A", price: 29.99 },
    { id: 2, name: "Product B", price: 49.99 },
  ]);
});

module.exports = router;
