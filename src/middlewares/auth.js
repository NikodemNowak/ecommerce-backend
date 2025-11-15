import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'

const JWT_SECRET = process.env.JWT_SECRET || 'byle_co_ale_trudne_do_zgadniecia'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  })
}

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: 'You do not have permission to access this resource' })
    }

    next()
  }
}
