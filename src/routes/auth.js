import express from 'express'
import AuthController from '../controllers/AuthController.js'

const router = express.Router()

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Autentykacja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Logowanie pomyślne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Nieprawidłowe dane logowania
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', AuthController.login)

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Odświeżanie tokenu dostępu
 *     tags: [Autentykacja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token odświeżony pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', AuthController.refresh)

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     tags: [Autentykacja]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 minLength: 6
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik utworzony pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Użytkownik już istnieje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', AuthController.register)

export default router
