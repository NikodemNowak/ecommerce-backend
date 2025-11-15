import express from 'express'
import OrderController from '../controllers/OrderController.js'
import { authenticateToken, authorizeRole } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticateToken, authorizeRole('ADMIN'), OrderController.getAll)
router.post('/', authenticateToken, OrderController.create)
router.get(
  '/status/:statusId',
  authenticateToken,
  authorizeRole('ADMIN'),
  OrderController.getByStatus
)
router.get('/user/:username', authenticateToken, OrderController.getByUser)
router.get('/:id', authenticateToken, OrderController.getById)
router.patch('/:id', authenticateToken, authorizeRole('ADMIN'), OrderController.changeStatus)

export default router
