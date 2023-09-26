const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const upload = require('../middlewares/upload')



router.route("/product")
    .get(adminController.getProduct)



router.route("/addproduct")
    .get(adminController.getAddProduct)
    .post(upload.array('images',3),adminController.postAddProduct)

module.exports = router;