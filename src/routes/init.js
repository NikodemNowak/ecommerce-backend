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

/**
 * @swagger
 * /init:
 *   post:
 *     summary: Inicjalizacja produktów (jednorazowa operacja)
 *     tags: [Inicjalizacja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Plik JSON lub CSV z produktami (max 5MB)
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/ProductCreate'
 *               - type: object
 *                 properties:
 *                   products:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       200:
 *         description: Produkty zainicjalizowane pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InitResponse'
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Brak uprawnień (wymagana rola ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Produkty są już zainicjalizowane
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('file'),
  ProductController.initialize
)

export default router
