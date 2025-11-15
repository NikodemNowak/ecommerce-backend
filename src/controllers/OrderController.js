import OrderService from '../services/OrderService.js'

const extractStatusFromBody = (body) => {
  if (!body) {
    return null
  }

  if (Array.isArray(body)) {
    const patchOp = body.find((op) => op.op?.toLowerCase() === 'replace' && op.path === '/status')
    return patchOp?.value ?? null
  }

  return body.status || body.newStatus || null
}

export default {
  async getAll(req, res) {
    try {
      const orders = await OrderService.getAllOrders()
      res.json(orders)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async create(req, res) {
    try {
      const order = await OrderService.createOrder(req.body)
      res.status(201).json(order)
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
      const orders = await OrderService.getOrdersByStatusId(req.params.statusId)
      res.json(orders)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },

  async changeStatus(req, res) {
    try {
      const statusValue = extractStatusFromBody(req.body)

      if (!statusValue) {
        return res.status(400).json({ error: 'Missing status value in request body' })
      }

      const updated = await OrderService.changeStatus(req.params.id, statusValue)
      res.json(updated)
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  },
}
