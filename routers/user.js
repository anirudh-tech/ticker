const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuth')



router.route('/')
    .get(userController.initial)

router.route('/homepage')
    .get(userController.home)


// router.route('/signup')
//     .get(userController.signup)
//     .post(userController.insertuser)

router.route('/signup')
    .get(userAuth.userTokenAuth,userController.getUserSignup)
    .post(userController.postUserSignup)


router.route('/product/:_id')
    .get(userAuth.userTokenAuth,userController.getProduct)



router.route('/emailVerification')
    .get(userController.getEmailVerification)
    .post(userController.otpAuth,userController.postEmailVerification)


router.route('/resendOtp')
    .get(userAuth.userExist,userController.resendOtp)
    .post(userController.otpAuth)


router.route('/login')
    .get(userAuth.userExist,userController.getUserLogin)
    .post(userController.postUserLogin)


router.route('/forgotpassword')
    .get(userAuth.userExist,userController.getForgotPassword)
    .post(userController.postForgotPassword)


router.route('/otpVerification')
    .get(userAuth.userExist,userController.getOtpVerification)
    .post(userController.passwordOtpAuth,userController.postOtpVerification)

router.route('/passwordResendOtp')
    .get(userAuth.userExist,userController.PasswordResendOtp)






router.route('/logout')
    .get(userController.getUserLogout)



module.exports = router;