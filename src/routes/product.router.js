const express = require('express')
const Controller = require('../controllers/product.controller')
const { verify } = require('../middlewares/verifyToken')

const router = express.Router()
router.post('/', verify, Controller.createProduct)
router.get('/', verify, Controller.allProduct)
router.post('/category', Controller.createProductCategory)
router.get('/category', Controller.allProductCategory)

module.exports = router