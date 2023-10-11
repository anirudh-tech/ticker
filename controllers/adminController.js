const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema")
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // admin:async (req,res)=>{
  //   const Email = "anirudhjagath2002@gmail"
  //   const Password = "12345"
  //   const hashedPassword = await bcrypt.hash(Password,10)
  //   const adminData = await Admin.create({Email:Email,Password:hashedPassword})
  //   console.log("created");
  // },

  initial: (req, res) => {
    res.redirect("/admin/login");
  },

  getLogin: async (req, res) => {
    res.render("admin/adminLogin");
  },

  postLogin: async (req, res) => {
    try {
      const Email = req.body.Email;
      console.log(req.body.Email);
      const Password = req.body.Password;
      const admin = await Admin.findOne({ Email: Email });
      console.log(admin);
      if (admin.Status === "Active") {
        const matchedPassword = await bcrypt.compare(Password, admin.Password);
        if (matchedPassword) {
          const accessToken = jwt.sign(
            { admin: admin._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: 60 * 60 }
          );
          res.cookie("adminJwt", accessToken, { maxAge: 60 * 1000 * 60 });
          req.session.admin = admin;
          res.redirect("/admin/product");
        } else {
          console.log(error);
          res.redirect("/admin/login");
        }
      } else {
        console.log(error);
        res.redirect("/admin/login");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/login");
    }
  },

  getProduct: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 10; // Number of items per page
      const skip = (page - 1) * perPage;

      // Query the database for products, skip and limit based on the pagination
      const products = await Product.find().skip(skip).limit(perPage).lean();

      const totalCount = await Product.countDocuments();

      res.render("admin/adminShowProducts", {
        products,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getAddProduct: async (req, res) => {
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("admin/addProduct", { categories, brands });
  },

  postAddProduct: async (req, res) => {
    try {
      console.log(req.files);
      const images = [];
      const productType = req.body.productType;
      const variations = [];
      const category = await Category.findOne({Name:req.body.Category})
      const BrandName = await Brand.findOne({Name:req.body.BrandName})
      if (productType === "watches") {
        const watchColors = req.body.watches;
        variations.push({ value: watchColors });
      } else if (productType === "perfumes") {
        const perfumeQuantity = req.body.perfumes;
        variations.push({ value: perfumeQuantity });
      }

      for (let i = 1; i <= 3; i++) {
        const fieldName = `image${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          images.push(req.files[fieldName][0].filename);
        }
      }
      let Status;
      if(req.body.AvailableQuantity <= 0 ){
        Status = "Out of Stock"
      }else{
        Status="In Stock";
      }
      const newProduct = new Product({
        ProductName: req.body.ProductName,
        Price: req.body.Price,
        Description: req.body.Description,
        BrandName: BrandName._id,
        Tags: req.body.Tags,
        AvailableQuantity: req.body.AvailableQuantity,
        Category: category._id,
        Status: Status,
        Display: "Active",
        Specification1: req.body.Specification1,
        Specification2: req.body.Specification2,
        Specification3: req.body.Specification3,
        Specification4: req.body.Specification4,
        DiscountAmount: req.body.DiscountAmount,
        Variation: variations[0].value,
        UpdatedOn: moment(new Date()).format("llll"),
        images:images
      });
      newProduct.save()
      res.redirect("/admin/product");
    } catch (error) {
      console.log(`An error happened ${error}`);
    }
  },

  getEditProduct: async (req, res) => {
    const _id = req.params._id;
    const categories = await Category.find();
    const brands = await Brand.find();
    const product = await Product.find({ _id });
    console.log(product);

    res.render("admin/editProduct", { product: product[0] ,categories,brands});
  },

  getUser: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 10; // Number of items per page
      const skip = (page - 1) * perPage;

      const users = await User.find().skip(skip).limit(perPage);
      const totalCount = await User.countDocuments();

      res.render("admin/manageUsers", {
        users,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });
    } catch (error) {
      res.send(error);
    }
  },

  blockUser: async (req, res) => {
    try {
      const _id = req.params._id;
      const userData = await User.findOne({ _id: _id });
      console.log(userData);
      if (userData.Status === "Active") {
        const user = await User.findByIdAndUpdate(_id, { Status: "Blocked" });
        const alertMessage = "This user is being blocked";
        req.session.alert = alertMessage;
        res.redirect("/admin/userslist");
      } else if (userData.Status === "Blocked") {
        const user = await User.findByIdAndUpdate(_id, { Status: "Active" });
        const alertMessage = "This user is being unblocked";
        req.session.alert = alertMessage;
        res.redirect("/admin/userslist");
      }
    } catch (error) {
      const alertMessage = "This is an alert message.";
      req.session.alert = alertMessage;
      res.redirect("/admin/userslist");
    }
  },

  blockProduct: async (req, res) => {
    try {
      const _id = req.params._id;
      const productData = await Product.findOne({ _id: _id });
      if (productData.Display === "Active") {
        const product = await Product.findByIdAndUpdate(_id, {
          Display: "Inactive",
        });
        res.redirect("/admin/product");
      } else if (productData.Display === "Inactive") {
        const product = await Product.findByIdAndUpdate(_id, {
          Display: "Active",
        });
        res.redirect("/admin/product");
      }
    } catch (error) {
      const alertMessage = "This is an alert message.";
      req.session.alert = alertMessage;
      res.redirect("/admin/product");
    }
  },

  postEditProduct: async (req, res) => {
    const _id = req.params._id;
    console.log(req.files);
    try {
      const images = [];
      const productType = req.body.productType;

      const variations = [];

      for (let i = 1; i <= 3; i++) {
        const fieldName = `image${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          images.push(req.files[fieldName][0].filename);
        }
      }

      const category = await Category.findOne({Name:req.body.Category})
      const BrandName = await Brand.findOne({Name:req.body.BrandName})

      if (productType === "watches") {
        const watchColors = req.body.watches;
        variations.push({ value: watchColors });
      } else if (productType === "perfumes") {
        const perfumeQuantity = req.body.perfumes;
        variations.push({ value: perfumeQuantity });
      }

      req.body.Variation = variations[0].value
      req.body.Category = category._id
      req.body.BrandName = BrandName._id
      if (images.length > 0) {
        req.body.images = images;
      }
      if(req.body.AvailableQuantity <= 0){
        req.body.Status = "Out of Stock"
      }
      // Process uploaded images
      

      const uploaded = await Product.findByIdAndUpdate(_id, req.body);
      res.redirect("/admin/product");
    } catch (error) {
      console.log(`An error happened ${error}`);
    }
  },

  getCategoriesAndBrands: async (req, res) => {
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("admin/categoriesAndBrands", { categories, brands });
  },

  getAddCategory: async (req, res) => {
    res.render("admin/addCategory");
  },

  postAddCategory: async (req, res) => {
    try {
      console.log(req.file);
      req.body.image = req.file.filename;
      const uploaded = await Category.create(req.body);
      res.redirect("/admin/categoriesandbrands");
    } catch (error) {
      console.log(error);
      req.flash("error", "Error Adding the Category");
      res.redirect("/admin/categoriesandbrands");
    }
  },

  getOrderDetails: async (req,res)=>{
    try {
      const orderId = req.params._id
      const orderDetails = await Order.findOne({_id:orderId}).populate('Items.ProductId')
      res.render('admin/adminOrderDetails',{order:orderDetails})
    } catch (error) {
      console.log(error);
    }
  },

  putUpdateStatus: async (req,res)=>{
    console.log("hereee");
    const orderId = req.params.orderId;
    const { status } = req.body;

    try {
        // Update the order status in the database
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { Status: status }, { new: true });

        // If the status is "Delivered," update the payment status to "paid"
        if (status.toLowerCase() === 'delivered') {
            updatedOrder.PaymentStatus = 'Paid';
        }else{
            updatedOrder.PaymentStatus = 'Pending';
        }

        // If the status is "rejected," update the payment status to "order rejected"
        if (status.toLowerCase() === 'rejected') {
            updatedOrder.PaymentStatus = 'order rejected';
        }

        // Save the changes to the order
        await updatedOrder.save();

        // Respond with the updated order
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getEditCategory: async (req, res) => {
    const _id = req.params._id;
    const category = await Category.findById(_id);
    res.render("admin/editCategory", { category });
  },

  getAddBrand: (req, res) => {
    res.render("admin/addBrand");
  },

  postAddBrand: async (req, res) => {
    try {
      const brands = await Brand.create(req.body);
      res.redirect("/admin/categoriesandbrands");
    } catch (error) {
      console.log(error);
      req.flash("error", "Error Adding the Brand");
      res.redirect("/admin/categoriesandbrands");
    }
  },
  
  getOrders: async (req,res)=>{
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;

            // Query the database for products, skip and limit based on the pagination
            const order = await Order.find()
                .skip(skip)
                .limit(perPage).lean();

            const totalCount = await Order.countDocuments();

            res.render('admin/adminOrders', {
                order,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });
  },


  getAdminLogout: (req, res) => {
    req.session.admin = false;
    res.clearCookie("adminJwt");
    res.redirect("/admin/login");
  },

};
