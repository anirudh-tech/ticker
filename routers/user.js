const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')


router.route('/')
    .get(userController.home)


router.route('/signup')
    .get(userController.signup)
    .post(userController.insertuser)



router.route('/emailVerification')
    .get(userController.verification)



router.route('/login')
    .get(userController.login)


router.route('/productDescription')
    .get(userController.description)



module.exports = router;