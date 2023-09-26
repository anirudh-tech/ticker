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

router.get('/signup',userController.getUserSignup)
router.post('/signup',userController.postUserSignup)

router.route('/signup')
    .get(userController.getUserSignup)
    .post(userController.postUserSignup)



router.route('/emailVerification')
    .get(userController.getEmailVerification)
    .post(userController.postEmailVerification)



router.route('/login')
    .get(userController.login)


router.route('/productDescription')
    .get(userController.description)






module.exports = router;