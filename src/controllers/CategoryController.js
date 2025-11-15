import categoryService from '../services/CategoryService.js'
import { handleControllerError } from '../utils/controllerErrorHandler.js'

export default {
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAll()
      res.json(categories)
    } catch (err) {
      handleControllerError(res, err)
    }
  },
}
