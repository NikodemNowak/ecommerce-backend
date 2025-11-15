import express from 'express'
import OrderController from '../controllers/OrderController.js'

const router = express.Router()

router.get('/', OrderController.getAll)
router.post('/', OrderController.create)
router.get('/status/:statusId', OrderController.getByStatus)
router.get('/user/:username', OrderController.getByUser)
router.get('/:id', OrderController.getById)
router.patch('/:id', OrderController.changeStatus)

export default router
