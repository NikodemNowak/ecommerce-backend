import { StatusCodes } from 'http-status-codes'

class AppError extends Error {
  constructor(message = 'Server error', statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.status = statusCode
    Error.captureStackTrace?.(this, this.constructor)
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, StatusCodes.BAD_REQUEST)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND)
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, StatusCodes.CONFLICT)
  }
}

export { AppError, BadRequestError, NotFoundError, ConflictError }
