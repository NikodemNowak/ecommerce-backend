import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import User from '../models/User.js'
import { BadRequestError, UnauthorizedError, ConflictError } from '../errors/AppError.js'

const JWT_SECRET = process.env.JWT_SECRET || 'byle_co_ale_trudne_do_zgadniecia'
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'byle_co_ale_trudne_do_zgadniecia_refresh'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '1d'

class AuthService {
  async login(username, password) {
    if (!username || !password) {
      throw new BadRequestError('Username and password are required')
    }

    let user
    try {
      user = await User.where({ username }).fetch()
    } catch (error) {
      if (error.message.includes('EmptyResponse')) {
        user = null
      } else {
        throw error
      }
    }

    if (!user || !user.get('id')) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const isPasswordValid = await argon2.verify(user.get('password'), password)

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.get('id'),
        username: user.get('username'),
        email: user.get('email'),
        role: user.get('role'),
      },
    }
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    let user
    try {
      user = await User.where({ id: decoded.id }).fetch()
    } catch (error) {
      if (error.message.includes('EmptyResponse')) {
        user = null
      } else {
        throw error
      }
    }

    if (!user || !user.get('id')) {
      throw new UnauthorizedError('User not found')
    }

    const accessToken = this.generateAccessToken(user)
    const newRefreshToken = this.generateRefreshToken(user)

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  async register(username, password, email) {
    if (!username || !password) {
      throw new BadRequestError('Username and password are required')
    }

    if (username.length < 3) {
      throw new BadRequestError('Username must be at least 3 characters')
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters')
    }

    let existingUser
    try {
      existingUser = await User.where({ username }).fetch()
    } catch (error) {
      if (error.message.includes('EmptyResponse')) {
        existingUser = null
      } else {
        throw error
      }
    }
    
    if (existingUser && existingUser.get('id')) {
      throw new ConflictError('Username already exists')
    }

    const hashedPassword = await argon2.hash(password)

    const user = await new User({
      username,
      password: hashedPassword,
      email: email || null,
      role: 'CUSTOMER',
    }).save()

    return {
      id: user.get('id'),
      username: user.get('username'),
      email: user.get('email'),
      role: user.get('role'),
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.get('id'),
        username: user.get('username'),
        role: user.get('role'),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.get('id'),
        username: user.get('username'),
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    )
  }
}

export default new AuthService()
