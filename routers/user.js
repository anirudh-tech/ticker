const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')


router.route('/')
    .get(userController.home)

router.route('/homepage')
    .get(userController.home)


// router.route('/signup')
//     .get(userController.signup)
//     .post(userController.insertuser)

router.route('/signup')
    .get(userController.getUserSignup)
    .post(userController.postUserSignup)

router.route('/signup')
    .get(userController.getUserSignup)
    .post(userController.postUserSignup)



router.route('/emailVerification')
    .get(userController.getEmailVerification)
    .post(userController.otpAuth,userController.postEmailVerification)



router.route('/login')
    .get(userController.getUserLogin)
    .post(userController.postUserLogin)


router.route('/productDescription')
    .get(userController.description)






module.exports = router;