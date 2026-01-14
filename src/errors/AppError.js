import { StatusCodes } from 'http-status-codes'
import { ProblemTypes, DEFAULT_TYPE } from './problemTypes.js'

class AppError extends Error {
  constructor(
    message = 'Server error',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    options = {}
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.status = statusCode
    this.type = options.type || DEFAULT_TYPE
    this.title = options.title || this.getDefaultTitle(statusCode)
    this.instance = options.instance || null
    Error.captureStackTrace?.(this, this.constructor)
  }

  getDefaultTitle(statusCode) {
    const titleMap = {
      [StatusCodes.BAD_REQUEST]: 'Bad Request',
      [StatusCodes.UNAUTHORIZED]: 'Unauthorized',
      [StatusCodes.FORBIDDEN]: 'Forbidden',
      [StatusCodes.NOT_FOUND]: 'Not Found',
      [StatusCodes.CONFLICT]: 'Conflict',
      [StatusCodes.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [StatusCodes.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [StatusCodes.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [StatusCodes.BAD_GATEWAY]: 'Bad Gateway',
      [StatusCodes.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    }
    return titleMap[statusCode] || 'Error'
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', options = {}) {
    super(message, StatusCodes.BAD_REQUEST, {
      ...options,
      type: options.type || ProblemTypes.BAD_REQUEST,
      title: options.title || 'Bad Request',
    })
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options = {}) {
    super(message, StatusCodes.NOT_FOUND, {
      ...options,
      type: options.type || ProblemTypes.NOT_FOUND,
      title: options.title || 'Not Found',
    })
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict', options = {}) {
    super(message, StatusCodes.CONFLICT, {
      ...options,
      type: options.type || ProblemTypes.CONFLICT,
      title: options.title || 'Conflict',
    })
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options = {}) {
    super(message, StatusCodes.FORBIDDEN, {
      ...options,
      type: options.type || ProblemTypes.FORBIDDEN,
      title: options.title || 'Forbidden',
    })
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', options = {}) {
    super(message, StatusCodes.UNAUTHORIZED, {
      ...options,
      type: options.type || ProblemTypes.UNAUTHORIZED,
      title: options.title || 'Unauthorized',
    })
  }
}

export { AppError, BadRequestError, NotFoundError, ConflictError, ForbiddenError, UnauthorizedError }
