import express from 'express'
import OrderController from '../controllers/OrderController.js'
import { authenticateToken, authorizeRole } from '../middlewares/auth.js'

const router = express.Router()

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Pobierz wszystkie zamówienia (tylko ADMIN)
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista wszystkich zamówień
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Brak autoryzacji
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
router.get('/', authenticateToken, authorizeRole('ADMIN'), OrderController.getAll)

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Utwórz nowe zamówienie
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreate'
 *     responses:
 *       201:
 *         description: Zamówienie utworzone pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, OrderController.create)

/**
 * @swagger
 * /orders/status/{statusId}:
 *   get:
 *     summary: Pobierz zamówienia po statusie (tylko ADMIN)
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID statusu (np. 3 dla ANULOWANE)
 *     responses:
 *       200:
 *         description: Lista zamówień o wskazanym statusie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: Brak uprawnień (wymagana rola ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/status/:statusId',
  authenticateToken,
  authorizeRole('ADMIN'),
  OrderController.getByStatus
)

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Pobierz zamówienia zalogowanego użytkownika
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista zamówień użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Brak autoryzacji
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user', authenticateToken, OrderController.getByUser)

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Pobierz zamówienia użytkownika po ID
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID użytkownika
 *     responses:
 *       200:
 *         description: Lista zamówień użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: Brak uprawnień (można zobaczyć tylko swoje zamówienia lub jako ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user/:userId', authenticateToken, OrderController.getByUser)

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Pobierz zamówienie po ID
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID zamówienia
 *     responses:
 *       200:
 *         description: Szczegóły zamówienia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Zamówienie nie znalezione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateToken, OrderController.getById)

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Zmień status zamówienia (tylko ADMIN)
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID zamówienia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatusUpdate'
 *           examples:
 *             simple:
 *               value:
 *                 status: ZATWIERDZONE
 *             jsonPatch:
 *               value:
 *                 - op: replace
 *                   path: /status
 *                   value: ZATWIERDZONE
 *     responses:
 *       200:
 *         description: Status zamówienia zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Błędne dane wejściowe lub naruszenie reguł biznesowych
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
 *         description: Zamówienie nie znalezione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', authenticateToken, authorizeRole('ADMIN'), OrderController.changeStatus)

/**
 * @swagger
 * /orders/{id}/opinions:
 *   post:
 *     summary: Dodaj opinię do zamówienia
 *     tags: [Zamówienia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID zamówienia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OpinionCreate'
 *     responses:
 *       201:
 *         description: Opinia dodana pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opinion'
 *       400:
 *         description: Błędne dane wejściowe, opinia już istnieje lub zamówienie ma niedozwolony status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Brak uprawnień (tylko właściciel zamówienia może dodać opinię)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Zamówienie nie znalezione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/opinions', authenticateToken, OrderController.addOpinion)

export default router
