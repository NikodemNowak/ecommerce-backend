import express from 'express'
import StatusController from '../controllers/StatusController.js'

const router = express.Router()

router.get('/', StatusController.getAll)

export default router
