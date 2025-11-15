import 'dotenv/config'
import express from 'express'
import productRoutes from './src/routes/products.js'
import categoryRoutes from './src/routes/category.js'
import orderRoutes from './src/routes/order.js'
import statusRoutes from './src/routes/status.js'
import authRoutes from './src/routes/auth.js'
import initRoutes from './src/routes/init.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/', authRoutes)
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/orders', orderRoutes)
app.use('/status', statusRoutes)
app.use('/init', initRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
