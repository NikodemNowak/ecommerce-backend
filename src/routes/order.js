import express from 'express'
import OrderController from '../controllers/OrderController.js'

const router = express.Router()

router.get('/', OrderController.getAll)
router.get('/:id', OrderController.getById)
router.get('/user/:username', OrderController.getByUser)
router.get('/status/:statusName', OrderController.getByStatus)
router.put('/:id', OrderController.changeStatus)

export default router
