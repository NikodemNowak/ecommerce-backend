import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Product from '../models/Product.js'
import Status from '../models/Status.js'
import { BadRequestError, NotFoundError } from '../errors/AppError.js'

const DEFAULT_STATUS_NAME = 'NIEZATWIERDZONE'
const STATUS_SEQUENCE = ['NIEZATWIERDZONE', 'ZATWIERDZONE', 'ZREALIZOWANE']

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
      throw new NotFoundError('Order not found')
    }

    return order
  }

  async createOrder(payload) {
    const { items = [], ...rest } = payload || {}
    const orderData = this._validateOrderData(rest)
    const normalizedItems = await this._validateAndNormalizeItems(items)

    const resolvedStatus = await this._resolveStatus(DEFAULT_STATUS_NAME, {
      allowDefault: true,
    })

    const savedOrder = await Order.forge({
      ...orderData,
      status_id: resolvedStatus.id,
    }).save()

    await Promise.all(
      normalizedItems.map((item) => OrderItem.forge({ ...item, order_id: savedOrder.id }).save())
    )

    return this.getById(savedOrder.id)
  }

  async getOrdersByUser(username) {
    if (!username) {
      throw new BadRequestError('Username is required')
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
    const normalizedCurrent = currentStatus?.toString().toUpperCase()
    const normalizedNext = newStatus.get('name')?.toString().toUpperCase()

    if (normalizedCurrent === 'ANULOWANE') {
      throw new BadRequestError('Cannot change status of a cancelled order')
    }

    if (normalizedCurrent === 'ZREALIZOWANE') {
      throw new BadRequestError('Cannot change status of a completed order')
    }

    if (this._isBackwardTransition(normalizedCurrent, normalizedNext)) {
      throw new BadRequestError(
        `Cannot change order status backwards (${normalizedCurrent} -> ${normalizedNext})`
      )
    }

    await order.save({ status_id: newStatus.id }, { patch: true })
    return this.getById(orderId)
  }

  _validateOrderData(data = {}) {
    const userNameValue = data.user_name ?? data.username
    const user_name = this._ensureNonEmptyString(userNameValue, 'User name')
    const email = this._validateEmail(data.email)
    const phone = this._validatePhone(data.phone)

    const result = {
      user_name,
      email,
      phone,
    }

    if (data.approved_at) {
      result.approved_at = data.approved_at
    }

    return result
  }

  async _validateAndNormalizeItems(items) {
    if (!Array.isArray(items) || !items.length) {
      throw new BadRequestError('Order must include at least one item')
    }

    const normalized = items.map((item, index) => this._validateSingleItem(item, index))
    await this._assertProductsExist(normalized)
    return normalized
  }

  _validateSingleItem(item, index) {
    if (!item || typeof item !== 'object') {
      throw new BadRequestError(`Order item #${index + 1} must be a valid object`)
    }

    const product = item.product_id ?? item.productId
    const quantity = item.quantity
    const unitPrice = item.unit_price ?? item.unitPrice

    const product_id = this._ensurePositiveInteger(product, `Product ID for item #${index + 1}`)
    const normalizedQuantity = this._ensurePositiveInteger(
      quantity,
      `Quantity for item #${index + 1}`
    )
    const normalizedPrice = this._ensurePositiveNumber(
      unitPrice,
      `Unit price for item #${index + 1}`
    )

    return {
      product_id,
      quantity: normalizedQuantity,
      unit_price: normalizedPrice,
    }
  }

  async _assertProductsExist(items) {
    const ids = [...new Set(items.map((item) => item.product_id))]

    const products = await Product.query((qb) => qb.whereIn('id', ids))
      .fetchAll()
      .catch(() => null)

    const foundIds = products ? products.map((product) => product.get('id')) : []
    const missing = ids.filter((id) => !foundIds.includes(id))

    if (missing.length) {
      throw new BadRequestError(`Products not found for IDs: ${missing.join(', ')}`)
    }
  }

  _validateEmail(value) {
    const email = this._ensureNonEmptyString(value, 'Email address')
    const normalized = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalized)) {
      throw new BadRequestError('Email address has invalid format')
    }

    return normalized
  }

  _validatePhone(value) {
    const phone = this._ensureNonEmptyString(value, 'Phone number')
    const normalized = phone.replace(/[\s-]/g, '')

    if (!/^\+?\d{6,15}$/.test(normalized)) {
      throw new BadRequestError(
        'Phone number must contain only digits, optional spaces or dashes, and may start with +'
      )
    }

    return normalized
  }

  _ensureNonEmptyString(value, label) {
    if (value === undefined || value === null) {
      throw new BadRequestError(`${label} cannot be empty`)
    }

    const normalized = value.toString().trim()
    if (!normalized) {
      throw new BadRequestError(`${label} cannot be empty`)
    }

    return normalized
  }

  _ensurePositiveNumber(value, label) {
    const asNumber = Number(value)
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      throw new BadRequestError(`${label} must be a positive number`)
    }
    return asNumber
  }

  _ensurePositiveInteger(value, label) {
    const asNumber = Number(value)
    if (!Number.isInteger(asNumber) || asNumber <= 0) {
      throw new BadRequestError(`${label} must be a positive integer`)
    }
    return asNumber
  }

  _isBackwardTransition(currentStatus, nextStatus) {
    const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus)
    const nextIndex = STATUS_SEQUENCE.indexOf(nextStatus)

    if (currentIndex === -1 || nextIndex === -1) {
      return false
    }

    return nextIndex < currentIndex
  }

  async _resolveStatus(statusInput, options = {}) {
    const { allowDefault = false } = options

    if (!statusInput) {
      if (!allowDefault) {
        throw new BadRequestError('Status value is required')
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
      throw new BadRequestError('Status ID is required')
    }

    const status = await Status.where({ id })
      .fetch()
      .catch(() => null)

    if (!status) {
      throw new NotFoundError('Status not found')
    }

    return status
  }

  async _getStatusByName(name) {
    if (!name) {
      throw new BadRequestError('Status name is required')
    }

    const normalized = name.toString().toUpperCase()

    const status = await Status.where({ name: normalized })
      .fetch()
      .catch(() => null)

    if (!status) {
      throw new NotFoundError('Status not found')
    }

    return status
  }

  _looksLikeId(value) {
    if (typeof value === 'number') {
      return Number.isInteger(value)
    }

    return typeof value === 'string' && /^\d+$/.test(value)
  }
}

export default new OrderService()
