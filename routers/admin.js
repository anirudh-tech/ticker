const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const upload = require('../middlewares/upload')
const adminAuth = require('../middlewares/adminAuth')
const { route } = require('./user')

router.route("/")
    .get(adminController.initial)


router.route("/login")
    .get(adminAuth.adminExist,adminController.getLogin)
    .post(adminController.postLogin)

router.route("/product")
    .get(adminAuth.adminTokenAuth,adminController.getProduct)

router.route('/editproduct/:_id')
    .get(adminAuth.adminTokenAuth,adminController.getEditProduct)
    .post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),adminController.postEditProduct)

router.route('/userslist')
    .get(adminAuth.adminTokenAuth,adminController.getUser)

router.route('/userlist/:_id')
    .get(adminAuth.adminTokenAuth,adminController.blockUser)

router.route('/product/:_id')
    .get(adminAuth.adminTokenAuth,adminController.blockProduct)


router.route('/categoriesandbrands')
    .get(adminAuth.adminTokenAuth,adminController.getCategoriesAndBrands)

router.route('/addcategory')
    .get(adminAuth.adminTokenAuth,adminController.getAddCategory)
    .post(upload.single('image'),adminController.postAddCategory)

router.route('/order/details/:_id')
    .get(adminAuth.adminTokenAuth,adminController.getOrderDetails)

router.route('/order/update-status/:orderId')
    .put(adminAuth.adminTokenAuth,adminController.putUpdateStatus)

router.route('/edit/:_id')
    .get(adminAuth.adminTokenAuth,adminController.getEditCategory)

router.route("/order")
    .get(adminAuth.adminTokenAuth,adminController.getOrders)

router.route('/count-orders-by-day')
    .get(adminAuth.adminTokenAuth,adminController.getCount)
router.route('/count-orders-by-month')
    .get(adminAuth.adminTokenAuth,adminController.getCount)
router.route('/count-orders-by-year')
    .get(adminAuth.adminTokenAuth,adminController.getCount)

router.route('/latestOrders')
.get(adminAuth.adminTokenAuth,adminController.getOrdersAndSellers)


router.route("/dashboard")
    .get(adminAuth.adminTokenAuth,adminController.getDashboard)

router.route("/addproduct")
    .get(adminAuth.adminTokenAuth,adminController.getAddProduct)
    .post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]),adminController.postAddProduct)


router.route("/addbrand")
    .get(adminAuth.adminTokenAuth,adminController.getAddBrand)
    .post(adminController.postAddBrand)

router.route("/logout")
    .get(adminController.getAdminLogout)

module.exports = router;