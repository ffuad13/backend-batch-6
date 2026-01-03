const express = require('express')
const Controller = require('../controllers/auth.controller')

const router = express.Router()
router.post('/register', Controller.register)
router.post('/login', Controller.login)
router.delete('/logout', Controller.logout)
router.post('/create-role', Controller.createRole)

module.exports = router