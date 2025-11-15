import statusService from '../services/StatusService.js'
import { handleControllerError } from '../utils/controllerErrorHandler.js'

export default {
  async getAll(_, res) {
    try {
      const statuses = await statusService.getAll()
      res.json(statuses)
    } catch (err) {
      handleControllerError(res, err)
    }
  },
}
