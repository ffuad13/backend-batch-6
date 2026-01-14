const express = require('express')
const Controller = require('../controllers/auth.controller')
const { verify } = require('jsonwebtoken')
const { userLimit } = require('../middlewares/rateLimit')

const router = express.Router()
router.post('/register', Controller.register)
router.post('/login', userLimit, Controller.login)
router.delete('/logout', Controller.logout)
router.get('/refreshToken', Controller.refreshTokenHandler)
router.post('/create-role', verify, Controller.createRole)

module.exports = router