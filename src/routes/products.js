import express from 'express'
import ProductController from '../controllers/ProductController.js'
import { authenticateToken, authorizeRole } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticateToken, ProductController.getAll)
router.get('/:id', authenticateToken, ProductController.getById)
router.post('/', authenticateToken, authorizeRole('ADMIN'), ProductController.create)
router.put('/:id', authenticateToken, authorizeRole('ADMIN'), ProductController.update)
router.get('/:id/seo-description', authenticateToken, ProductController.seoDescription)

export default router
