import Status from '../models/Status.js'

class StatusService {
  async getAll() {
    return Status.fetchAll()
  }
}

export default new StatusService()
