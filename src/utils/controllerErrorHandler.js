import { StatusCodes } from 'http-status-codes'

export function handleControllerError(res, err) {
  const status = resolveStatus(err)
  const message = err?.message || 'Server error'

  console.error(err)

  return res.status(status).json({ error: message })
}

function resolveStatus(err) {
  const status = err?.statusCode ?? err?.status
  if (status && Number.isInteger(status)) {
    return status
  }

  return StatusCodes.INTERNAL_SERVER_ERROR
}
