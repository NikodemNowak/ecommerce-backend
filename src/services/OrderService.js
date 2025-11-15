import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Product from '../models/Product.js'
import Status from '../models/Status.js'
import Opinion from '../models/Opinion.js'
import { BadRequestError, NotFoundError, ForbiddenError } from '../errors/AppError.js'

const DEFAULT_STATUS_NAME = 'NIEZATWIERDZONE'
const STATUS_SEQUENCE = ['NIEZATWIERDZONE', 'ZATWIERDZONE', 'ZREALIZOWANE']
const OPINION_ALLOWED_STATUSES = ['ZREALIZOWANE', 'ANULOWANE']

class OrderService {
  async getAllOrders() {
    return Order.fetchAll({
      withRelated: ['status', 'items', 'opinions', 'user'],
    })
  }

  async getById(id) {
    const order = await Order.where({ id })
      .fetch({ withRelated: ['status', 'items', 'opinions', 'user'] })
      .catch(() => null)

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    return order
  }

  async createOrder(payload, user) {
    if (!user || !user.id) {
      throw new BadRequestError('User authentication is required to create an order')
    }

    const { items = [] } = payload || {}
    const normalizedItems = await this._validateAndNormalizeItems(items)

    const resolvedStatus = await this._resolveStatus(DEFAULT_STATUS_NAME, {
      allowDefault: true,
    })

    const user_id = this._ensurePositiveInteger(user.id, 'User ID')

    const savedOrder = await Order.forge({
      user_id,
      status_id: resolvedStatus.id,
    }).save()

    await Promise.all(
      normalizedItems.map((item) => OrderItem.forge({ ...item, order_id: savedOrder.id }).save())
    )

    return this.getById(savedOrder.id)
  }

  async getOrdersByUserId(userId) {
    if (!userId) {
      throw new BadRequestError('User ID is required')
    }

    const normalizedUserId = this._ensurePositiveInteger(userId, 'User ID')

    return Order.where({ user_id: normalizedUserId }).fetchAll({
      withRelated: ['status', 'items', 'opinions', 'user'],
    })
  }

  async getOrdersByStatusId(statusId) {
    const status = await this._getStatusById(statusId)

    return Order.where({ status_id: status.id }).fetchAll({
      withRelated: ['status', 'items', 'opinions', 'user'],
    })
  }

  async addOpinion(orderId, user = {}, payload = {}) {
    const normalizedOrderId = this._ensurePositiveInteger(orderId, 'Order ID')

    const order = await Order.where({ id: normalizedOrderId })
      .fetch({ withRelated: ['status'] })
      .catch(() => null)

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    const existingOpinion = await Opinion.where({ order_id: normalizedOrderId })
      .fetch()
      .catch(() => null)

    if (existingOpinion) {
      throw new BadRequestError('Opinion for this order already exists')
    }

    if (!user || !user.id) {
      throw new ForbiddenError('Authentication required to add an opinion')
    }

    const orderUserId = order.get('user_id')
    const requestUserId = this._ensurePositiveInteger(user.id, 'User ID')

    if (!orderUserId || orderUserId !== requestUserId) {
      throw new ForbiddenError('You can only add an opinion to your own order')
    }

    const statusName = order.related('status')?.get('name')?.toString().toUpperCase()

    if (!OPINION_ALLOWED_STATUSES.includes(statusName)) {
      throw new BadRequestError('Opinion can only be added for completed or cancelled orders')
    }

    const { rating, content } = this._validateOpinionPayload(payload)

    const opinion = await Opinion.forge({
      order_id: normalizedOrderId,
      rating,
      content,
    }).save()

    return opinion
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

    const patchPayload = { status_id: newStatus.id }

    if (this._shouldSetApprovalDate(normalizedNext, order.get('approved_at'))) {
      patchPayload.approved_at = new Date().toISOString()
    }

    await order.save(patchPayload, { patch: true })
    return this.getById(orderId)
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

  _validateOpinionPayload(payload = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestError('Opinion payload is required')
    }

    const rating = Number(payload.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5')
    }

    const content = this._ensureNonEmptyString(payload.content, 'Opinion content')

    return {
      rating,
      content,
    }
  }

  _shouldSetApprovalDate(nextStatus, currentApprovedAt) {
    if (currentApprovedAt) {
      return false
    }

    return ['ZATWIERDZONE', 'ZREALIZOWANE'].includes(nextStatus)
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
