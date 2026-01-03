const express = require('express')
const Controller = require('../controllers/transaction.controller')
const { verify } = require('../middlewares/verifyToken')

const router = express.Router()
router.post('/', verify, Controller.createTransaction)


module.exports = router