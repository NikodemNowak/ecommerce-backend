import { DEFAULT_TYPE } from '../errors/problemTypes.js'

export function createProblemDetails(options) {
  const { type = DEFAULT_TYPE, title, status, detail, instance } = options

  const problem = {
    type,
    title,
    status,
    detail,
  }

  if (instance) {
    problem.instance = instance
  }

  return problem
}

export function formatErrorResponse(err, requestPath) {
  const status = err.statusCode ?? err.status ?? 500
  const title = err.title ?? getDefaultTitle(status)
  const type = err.type ?? DEFAULT_TYPE
  const detail = err.message ?? 'An error occurred'
  const instance = requestPath

  return createProblemDetails({
    type,
    title,
    status,
    detail,
    instance,
  })
}

function getDefaultTitle(status) {
  const titleMap = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  }
  return titleMap[status] ?? 'Error'
}
