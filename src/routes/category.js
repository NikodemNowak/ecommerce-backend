import express from 'express'
import CategoryController from '../controllers/CategoryController.js'

const router = express.Router()

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Pobierz wszystkie kategorie
 *     tags: [Kategorie]
 *     responses:
 *       200:
 *         description: Lista kategorii
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', CategoryController.getAll)

export default router
