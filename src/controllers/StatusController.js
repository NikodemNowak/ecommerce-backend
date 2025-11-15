import statusService from '../services/StatusService.js'

export default {
  async getAll(_, res) {
    try {
      const statuses = await statusService.getAll()
      res.json(statuses)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  },
}
