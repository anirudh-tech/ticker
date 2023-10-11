const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuth')



router.route('/')
    .get(userController.initial)

router.route('/homepage')
    .get(userController.home)

router.route('/shop')
    .get(userAuth.userTokenAuth,userController.getShop)

router.route('/category/:_id')
    .get(userAuth.userTokenAuth,userController.getShop)


router.route('/brand/:_id')
    .get(userAuth.userTokenAuth,userController.getShop)

router.route('/signup')
    .get(userAuth.userTokenAuth,userController.getUserSignup)
    .post(userController.postUserSignup)


router.route('/product/:_id')
    .get(userAuth.userTokenAuth,userController.getProduct)



router.route('/emailVerification')
    .get(userAuth.userExist,userController.getEmailVerification)
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


router.route('/addtocart/:_id')
    .get(userAuth.userTokenAuth ,userController.addToCart)

router.route('/cart')
    .get(userAuth.userTokenAuth,userController.cart)
    .post(userAuth.userTokenAuth,userController.postCart)

router.route('/checkout')
    .get(userAuth.userTokenAuth,userController.getCheckout)
    .post(userAuth.userTokenAuth,userController.postCheckout)


router.route('/orderSuccess')
    .get(userAuth.userTokenAuth,userController.getOrderSucces)


router.route('/addAddress')
    .post(userAuth.userTokenAuth, userController.postAddressForm)

router.route('/addAddress-Checkout')
    .post(userAuth.userTokenAuth,userController.addAddressCheckout)

router.route('/editAddress')
    .get(userAuth.userTokenAuth,userController.getEditAddress)

router.route('/editAddress/:_id')
    .post(userAuth.userTokenAuth,userController.postEditAddress)

router.route('/updateQuantity')
    .post(userAuth.userTokenAuth,userController.updatingQuantity)

router.route('/profile')
    .get(userAuth.userTokenAuth,userController.profile)

router.route('/removefromcart/:_id')
    .get(userAuth.userTokenAuth, userController.removeFromCart)


router.route('/orderList')
    .get(userAuth.userTokenAuth,userController.getOrderList)


router.route('/order/details/:_id')
    .get(userAuth.userTokenAuth,userController.getOrderDetails)

router.route('/order/cancel/:_id')
    .get(userAuth.userTokenAuth,userController.cancelOrder)


router.route("/trackOrder")
    .get(userAuth.userTokenAuth,userController.getTrackOrder)





router.route('/logout')
    .get(userController.getUserLogout)



module.exports = router;