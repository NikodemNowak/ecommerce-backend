import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { ProblemTypes } from '../errors/problemTypes.js'
import { createProblemDetails } from '../utils/problemDetails.js'

const JWT_SECRET = process.env.JWT_SECRET || 'byle_co_ale_trudne_do_zgadniecia'

function sendProblem(res, status, title, detail) {
  const problem = createProblemDetails({
    type: ProblemTypes.UNAUTHORIZED,
    title,
    status,
    detail,
    instance: res.req?.path,
  })
  res.status(status).set('Content-Type', 'application/problem+json').json(problem)
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return sendProblem(res, StatusCodes.UNAUTHORIZED, 'Unauthorized', 'Access token required')
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendProblem(res, StatusCodes.FORBIDDEN, 'Forbidden', 'Invalid or expired token')
    }

    req.user = user
    next()
  })
}

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendProblem(res, StatusCodes.UNAUTHORIZED, 'Unauthorized', 'Authentication required')
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendProblem(
        res,
        StatusCodes.FORBIDDEN,
        'Forbidden',
        'You do not have permission to access this resource'
      )
    }

    next()
  }
}
