const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const productRoutes = require("./controllers/products");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("E-commerce Backend is running");
});
app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
