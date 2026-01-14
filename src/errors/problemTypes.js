// Base URL for error documentation - change to production URL
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

export const ProblemTypes = {
  BAD_REQUEST: `${BASE_URL}/problems/bad-request.html`,
  NOT_FOUND: `${BASE_URL}/problems/not-found.html`,
  CONFLICT: `${BASE_URL}/problems/conflict.html`,
  FORBIDDEN: `${BASE_URL}/problems/forbidden.html`,
  UNAUTHORIZED: `${BASE_URL}/problems/unauthorized.html`,
  VALIDATION_ERROR: `${BASE_URL}/problems/validation-error.html`,
  INTERNAL_ERROR: `${BASE_URL}/problems/internal-error.html`,
}

export const DEFAULT_TYPE = 'about:blank'
