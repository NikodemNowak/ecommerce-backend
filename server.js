import express from 'express'
import productRoutes from './src/routes/products.js'
import categoryRoutes from './src/routes/category.js'
import orderRoutes from './src/routes/order.js'
import statusRoutes from './src/routes/status.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.get('/', (req, res) => {
  res.send('E-commerce Backend is running')
})
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/orders', orderRoutes)
app.use('/status', statusRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
