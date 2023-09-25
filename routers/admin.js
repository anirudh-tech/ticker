const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')


router.get("/products",adminController.showProducts)
router.get("/addproduct",adminController.addProduct)

module.exports = router;