const express = require('express')
const Controller = require('../controllers/user.controller')
const { uploadUser } = require('../middlewares/upload')
const { verify } = require('../middlewares/verifyToken')

const router = express.Router()
router.get('/profile', verify, Controller.profile)
router.patch('/upload', verify, uploadUser.single("foto"), Controller.uploadUser)
router.get('/:id', Controller.user)
router.get('/', Controller.users)

module.exports = router