import express from 'express'
import ProductController from '../controllers/ProductController.js'
import { authenticateToken, authorizeRole } from '../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Pobierz wszystkie produkty
 *     tags: [Produkty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista produktów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Brak autoryzacji
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, ProductController.getAll)

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Pobierz produkt po ID
 *     tags: [Produkty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produktu
 *     responses:
 *       200:
 *         description: Szczegóły produktu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produkt nie znaleziony
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateToken, ProductController.getById)

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Utwórz nowy produkt
 *     tags: [Produkty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Produkt utworzony pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 */
router.post('/', authenticateToken, authorizeRole('ADMIN'), ProductController.create)

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Aktualizuj produkt
 *     tags: [Produkty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produktu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Produkt zaktualizowany pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 *       404:
 *         description: Produkt nie znaleziony
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, authorizeRole('ADMIN'), ProductController.update)

/**
 * @swagger
 * /products/{id}/seo-description:
 *   get:
 *     summary: Generuj SEO opis produktu przy użyciu AI
 *     tags: [Produkty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produktu
 *     responses:
 *       200:
 *         description: SEO opis wygenerowany pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SEODescription'
 *       400:
 *         description: Błąd generowania (brak GROQ_API_KEY lub błąd API)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produkt nie znaleziony
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/seo-description', authenticateToken, ProductController.seoDescription)

export default router
