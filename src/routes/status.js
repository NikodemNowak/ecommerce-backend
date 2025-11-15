import express from 'express'
import StatusController from '../controllers/StatusController.js'

const router = express.Router()

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Pobierz wszystkie statusy zamówień
 *     tags: [Statusy]
 *     responses:
 *       200:
 *         description: Lista statusów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Status'
 */
router.get('/', StatusController.getAll)

export default router
