import AuthService from '../services/AuthService.js'
import { handleControllerError } from '../utils/controllerErrorHandler.js'
import { StatusCodes } from 'http-status-codes'

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body
      const result = await AuthService.login(username, password)
      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      handleControllerError(res, err, req)
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body
      const result = await AuthService.refresh(refreshToken)
      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      handleControllerError(res, err, req)
    }
  }

  async register(req, res) {
    try {
      const { username, password, email } = req.body
      const user = await AuthService.register(username, password, email)
      res.status(StatusCodes.CREATED).json(user)
    } catch (err) {
      handleControllerError(res, err, req)
    }
  }
}

export default new AuthController()
