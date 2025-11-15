import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Status from '../models/Status.js'

const DEFAULT_STATUS_NAME = 'NIEZATWIERDZONE'

class OrderService {
  async getAllOrders() {
    return Order.fetchAll({
      withRelated: ['status', 'items', 'opinions'],
    })
  }

  async getById(id) {
    const order = await Order.where({ id })
      .fetch({ withRelated: ['status', 'items', 'opinions'] })
      .catch(() => null)

    if (!order) {
      throw this._notFoundError('Order not found')
    }

    return order
  }

  async createOrder(payload) {
    const { items = [], ...rest } = payload || {}
    const orderData = this._extractOrderFields(rest)

    if (!orderData.user_name || !orderData.email || !orderData.phone) {
      throw this._badRequestError('Missing required order data (user_name, email, phone)')
    }

    const resolvedStatus = await this._resolveStatus(DEFAULT_STATUS_NAME, {
      allowDefault: true,
    })

    const savedOrder = await Order.forge({
      ...orderData,
      status_id: resolvedStatus.id,
    }).save()

    const normalizedItems = this._normalizeItems(items)

    await Promise.all(
      normalizedItems.map((item) => OrderItem.forge({ ...item, order_id: savedOrder.id }).save())
    )

    return this.getById(savedOrder.id)
  }

  async getOrdersByUser(username) {
    if (!username) {
      throw this._badRequestError('Username is required')
    }

    return Order.where({ user_name: username }).fetchAll({
      withRelated: ['status', 'items', 'opinions'],
    })
  }

  async getOrdersByStatusId(statusId) {
    const status = await this._getStatusById(statusId)

    return Order.where({ status_id: status.id }).fetchAll({
      withRelated: ['status', 'items', 'opinions'],
    })
  }

  async changeStatus(orderId, statusInput) {
    const order = await this.getById(orderId)
    const newStatus = await this._resolveStatus(statusInput)

    const currentStatus = order.related('status').get('name')

    if (currentStatus === 'ANULOWANE') {
      throw this._badRequestError('Cannot complete cancelled order')
    }

    if (currentStatus === 'ZREALIZOWANE') {
      throw this._badRequestError('Cannot change status of completed order')
    }

    await order.save({ status_id: newStatus.id }, { patch: true })
    return this.getById(orderId)
  }

  _extractOrderFields(data = {}) {
    const result = {}

    if (data.user_name || data.username) {
      result.user_name = data.user_name ?? data.username
    }

    if (data.email) {
      result.email = data.email
    }

    if (data.phone) {
      result.phone = data.phone
    }

    if (data.approved_at) {
      result.approved_at = data.approved_at
    }

    return result
  }

  _normalizeItems(items) {
    if (!Array.isArray(items)) {
      return []
    }

    return items
      .map((item) => {
        const productId = item?.product_id ?? item?.productId
        const quantity = item?.quantity
        const unitPrice = item?.unit_price ?? item?.unitPrice

        if (!productId || !quantity || !unitPrice) {
          return null
        }

        return {
          product_id: productId,
          quantity,
          unit_price: unitPrice,
        }
      })
      .filter(Boolean)
  }

  async _resolveStatus(statusInput, options = {}) {
    const { allowDefault = false } = options

    if (!statusInput) {
      if (!allowDefault) {
        throw this._badRequestError('Status value is required')
      }

      return this._getDefaultStatus()
    }

    if (this._looksLikeId(statusInput)) {
      return this._getStatusById(Number(statusInput))
    }

    return this._getStatusByName(statusInput)
  }

  async _getDefaultStatus() {
    return this._getStatusByName(DEFAULT_STATUS_NAME)
  }

  async _getStatusById(id) {
    if (!id) {
      throw this._badRequestError('Status ID is required')
    }

    const status = await Status.where({ id })
      .fetch()
      .catch(() => null)

    if (!status) {
      throw this._notFoundError('Status not found')
    }

    return status
  }

  async _getStatusByName(name) {
    if (!name) {
      throw this._badRequestError('Status name is required')
    }

    const normalized = name.toString().toUpperCase()

    const status = await Status.where({ name: normalized })
      .fetch()
      .catch(() => null)

    if (!status) {
      throw this._notFoundError('Status not found')
    }

    return status
  }

  _looksLikeId(value) {
    if (typeof value === 'number') {
      return Number.isInteger(value)
    }

    return typeof value === 'string' && /^\d+$/.test(value)
  }

  _notFoundError(message) {
    const error = new Error(message)
    error.status = 404
    return error
  }

  _badRequestError(message) {
    const error = new Error(message)
    error.status = 400
    return error
  }
}

export default new OrderService()
