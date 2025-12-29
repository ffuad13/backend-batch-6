const express = require('express')
const Controller = require('../controllers/user.controller')

const router = express.Router()
router.get('/', Controller.users)
router.get('/:id', Controller.user)

module.exports = router