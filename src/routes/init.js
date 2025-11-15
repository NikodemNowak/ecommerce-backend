import express from 'express'
import multer from 'multer'
import ProductController from '../controllers/ProductController.js'
import { authenticateToken, authorizeRole } from '../middlewares/auth.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

router.post(
  '/',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('file'),
  ProductController.initialize
)

export default router
