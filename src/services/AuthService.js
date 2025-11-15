import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import User from '../models/User.js'
import { AppError } from '../errors/AppError.js'
import { StatusCodes } from 'http-status-codes'

const JWT_SECRET = process.env.JWT_SECRET || 'byle_co_ale_trudne_do_zgadniecia'
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'byle_co_ale_trudne_do_zgadniecia_refresh'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '1d'

class AuthService {
  async login(username, password) {
    if (!username || !password) {
      throw new AppError('Username and password are required', StatusCodes.BAD_REQUEST)
    }

    const user = await User.where({ username }).fetch()

    if (!user) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
    }

    const isPasswordValid = await argon2.verify(user.get('password'), password)

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED)
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
      throw new AppError('Refresh token is required', StatusCodes.BAD_REQUEST)
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', StatusCodes.UNAUTHORIZED)
    }

    const user = await User.where({ id: decoded.id }).fetch()

    if (!user) {
      throw new AppError('User not found', StatusCodes.UNAUTHORIZED)
    }

    const accessToken = this.generateAccessToken(user)
    const newRefreshToken = this.generateRefreshToken(user)

    return {
      accessToken,
      refreshToken: newRefreshToken,
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
