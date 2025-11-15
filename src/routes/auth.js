import express from 'express'
import AuthController from '../controllers/AuthController.js'

const router = express.Router()

router.post('/login', AuthController.login)
router.post('/refresh', AuthController.refresh)

export default router
