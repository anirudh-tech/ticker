const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports= {
    getOffers: async (req,res)=>{
        try {
            res.render('admin/offers')
        } catch (error) {
            
        }
    }

}
