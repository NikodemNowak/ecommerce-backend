import { StatusCodes } from 'http-status-codes'
import { formatErrorResponse } from './problemDetails.js'

export function handleControllerError(res, err, req) {
  const status = resolveStatus(err)
  console.error(err)

  const problem = formatErrorResponse(err, req?.path)

  return res.status(status).set('Content-Type', 'application/problem+json').json(problem)
}

function resolveStatus(err) {
  const status = err?.statusCode ?? err?.status
  if (status && Number.isInteger(status)) {
    return status
  }

  return StatusCodes.INTERNAL_SERVER_ERROR
}
