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
      handleControllerError(res, err)
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body
      const result = await AuthService.refresh(refreshToken)
      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      handleControllerError(res, err)
    }
  }
}

export default new AuthController()
