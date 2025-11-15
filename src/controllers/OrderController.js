import { StatusCodes } from 'http-status-codes'
import OrderService from '../services/OrderService.js'
import { handleControllerError } from '../utils/controllerErrorHandler.js'

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
      handleControllerError(res, err)
    }
  },

  async create(req, res) {
    try {
      const order = await OrderService.createOrder(req.body)
      res.status(StatusCodes.CREATED).json(order)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async getById(req, res) {
    try {
      const order = await OrderService.getById(req.params.id)
      res.json(order)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async getByUser(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.params.username)
      res.json(orders)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async getByStatus(req, res) {
    try {
      const orders = await OrderService.getOrdersByStatusId(req.params.statusId)
      res.json(orders)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async changeStatus(req, res) {
    try {
      const statusValue = extractStatusFromBody(req.body)

      if (!statusValue) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Missing status value in request body' })
      }

      const updated = await OrderService.changeStatus(req.params.id, statusValue)
      res.json(updated)
    } catch (err) {
      handleControllerError(res, err)
    }
  },

  async addOpinion(req, res) {
    try {
      const opinion = await OrderService.addOpinion(req.params.id, req.user, req.body)
      res.status(StatusCodes.CREATED).json(opinion)
    } catch (err) {
      handleControllerError(res, err)
    }
  },
}
