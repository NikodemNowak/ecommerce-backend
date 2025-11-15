import Order from '../models/Order.js'
import Status from '../models/Status.js'
import User from '../models/User.js'

class OrderService {
  async getAllOrders() {
    return Order.fetchAll({
      withRelated: ['status', 'user', 'items', 'opinions'],
    })
  }

  async getById(id) {
    const order = await Order.where({ id })
      .fetch({ withRelated: ['status', 'user', 'items', 'opinions'] })
      .catch(() => null)

    if (!order) {
      throw this._notFoundError('Order not found')
    }

    return order
  }

  async getOrdersByUser(username) {
    const user = await User.where({ username })
      .fetch()
      .catch(() => null)

    if (!user) {
      throw this._notFoundError('User not found')
    }

    return Order.where({ user_id: user.id }).fetchAll({
      withRelated: ['status', 'items', 'opinions'],
    })
  }

  async getOrdersByStatus(statusName) {
    const status = await Status.where({ name: statusName })
      .fetch()
      .catch(() => null)

    if (!status) {
      throw this._notFoundError('Status not found')
    }

    return Order.where({ status_id: status.id }).fetchAll({
      withRelated: ['status', 'user', 'items', 'opinions'],
    })
  }

  async changeStatus(orderId, newStatusName) {
    const order = await this.getById(orderId)
    const newStatus = await Status.where({ name: newStatusName })
      .fetch()
      .catch(() => null)

    if (!newStatus) {
      throw this._notFoundError('Status not found')
    }

    const currentStatus = order.related('status').get('name')

    if (currentStatus === 'ANULOWANE') {
      throw this._badRequestError('Cannot complete cancelled order')
    }

    if (currentStatus === 'ZREALIZOWANE') {
      throw this._badRequestError('Cannot change status of completed order')
    }

    await order.save({ status_id: newStatus.id })
    return this.getById(orderId)
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
