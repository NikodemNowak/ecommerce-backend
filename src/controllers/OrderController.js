import OrderService from '../services/OrderService.js'

export default {
  async getAll(req, res) {
    try {
      const orders = await OrderService.getAllOrders()
      res.json(orders)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async getById(req, res) {
    try {
      const order = await OrderService.getById(req.params.id)
      res.json(order)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async getByUser(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.params.username)
      res.json(orders)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async getByStatus(req, res) {
    try {
      const orders = await OrderService.getOrdersByStatus(req.params.statusName.toUpperCase())
      res.json(orders)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async changeStatus(req, res) {
    try {
      const updated = await OrderService.changeStatus(req.params.id, req.body.status.toUpperCase())
      res.json(updated)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },
}
