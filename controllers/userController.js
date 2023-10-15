const OTP = require("../models/otpSchema");
const User = require('../models/userSchema') 
const otpFunctions = require("../utility/otpFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Cart = require("../models/cartSchema");
const Order = require("..//models/orderSchema")
const Brand = require("../models/brandSchema")
const moment = require("moment");
const nodemailer = require("nodemailer");
const flash = require("express-flash");
const mongoose = require("mongoose");
const crypto = require('crypto')
const razorpay = require('../utility/razorpay')
module.exports = {
  initial: (req, res) => {
    try {
      res.redirect("/homepage");
    } catch (error) {
      console.log(error);
    }
  },
  //signup get
  getUserSignup: (req, res) => {
    try {
      res.render("user/sign-up", { messages: req.flash() });
    } catch (error) {
      console.log(error);
    }
  },

  postUserSignup: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt();
      req.body.Password = await bcrypt.hash(req.body.Password, salt);
      req.body.confirmPassword = await bcrypt.hash(
        req.body.confirmPassword,
        salt
      );
      const user = req.body;
      const Email = req.body.Email;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

      // Test an email address against the regex pattern
      const isValidEmail = emailRegex.test(Email);
      console.log(req.body.Password);
      console.log(req.body.confirmPassword);

      if (req.body.Password === req.body.confirmPassword) {
        if (isValidEmail) {
          console.log("Valid email address");
          req.session.user = req.body;
          const existingUser = await User.findOne({ Email: req.body.Email });
          if (existingUser) {
            req.flash("error", "Email already exist");
            console.log("email exist" + error);
            // Email already exists, send an error message or handle it as needed
            res.redirect("/signup");
          } else {
            otpToBeSent = otpFunctions.generateOTP();
            const result = otpFunctions.sendOTP(req, res, Email, otpToBeSent);
          }
        } else {
          res.redirect("/signup");
          console.log("Invalid email address");
        }
      } else {
        req.flash("error", "Password Doesn't Match");
        res.redirect("/signup");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/signup");
    }
  },

  getEmailVerification: async (req, res) => {
    try {
      const Email = req.session.user.Email
      setTimeout(() => {
        OTP.deleteOne({ Email: Email })
          .then(() => {
            console.log("Document deleted successfully");
          })
          .catch((err) => {
            console.error(err);
          });
      }, 30000);
      res.render("user/emailVerification", { messages: req.flash() });    
    } catch (error) {
      console.log(error);
      res.redirect('/signup')
    }
  },

  otpAuth: async (req, res, next) => {
    try {
      let { otp } = req.body;

      console.log(req.session.user.Email);
      const matchedOTPrecord = await OTP.findOne({
        Email: req.session.user.Email,
      });
      if (!matchedOTPrecord) {
        throw new Error("No OTP records found for the provided email.");
      }

      const { expiresAt } = matchedOTPrecord;

      // Checking for expired codes
      if (expiresAt < Date.now()) {
        await OTP.deleteOne({ Email });
        throw new Error("The OTP code has expired. Please request a new one.");
      }

      console.log(otp);
      const dbOTP = matchedOTPrecord.otp;
      if (otp == dbOTP) {
        req.session.OtpValid = true;
        next();
      } else {
        // Invalid OTP
        console.log("INVALID");
        req.flash("error", "OTP IS INVALID");
        res.redirect("/emailVerification");
      }
    } catch (error) {
      console.error(error);
      res.redirect("/emailverification");
    }
  },

  resendOtp: async (req, res) => {
    try {
        const duration = 5;
        const Email = req.session.user.Email;
        otpToBeSent = otpFunctions.generateOTP();
        console.log(otpToBeSent);
        console.log("ivdeee ethi");
        const result = otpFunctions.resendOTP(req, res, Email, otpToBeSent);
    } catch (error) {
      console.log(error);
      req.flash("error", "error sending OTP");
      res.redirect("/emailVerification");
    }
  },

  //email verification
  postEmailVerification: async (req, res) => {
    try {
      const userData = await User.create(req.session.user);

      if (userData) {
        const accessToken = jwt.sign(
          { user: userData._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 60 * 60 }
        );
        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });

        res.redirect("/homepage");
      }
    } catch (error) {
      res.redirect("/signup");
    }
  },

  getUserLogin: (req, res) => {
    res.render("user/log-in", { error: req.session.error });
  },

  postUserLogin: async (req, res) => {
    try {
      const user = await User.findOne({ Email: req.body.Email });
      if (user.Status === "Active") {
        if (user) {
          const passwordMatch = await bcrypt.compare(
            req.body.Password,
            user.Password
          );
          if (passwordMatch) {
            const accessToken = jwt.sign(
              { user: user._id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: 60 * 60 }
            );
            res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });
            req.session.user = user;
            res.redirect("/homepage");
          } else {
            req.flash("error", "invalid username or password");
            res.redirect("/login");
          }
        } else {
          req.flash("error", "invalid username or password");
          res.redirect("/login");
        }
      } else {
        req.flash("error", "You have been banned");
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "invalid username or password");
      res.redirect("/login");
    }
  },

  home: async (req, res) => {
    console.log(req.session.user);
    const categories = await Category.find();
    const products = await Product.find({ Display: "Active" })
      .sort({ _id: -1 })
      .limit(8);
    res.render("user/homepage", {
      user: req.session.user,
      products,
      categories,
    });
  },

  getShop: async (req,res)=>{
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 10; // Number of items per page
      const skip = (page - 1) * perPage;

      const users = await User.find().skip(skip).limit(perPage);
      const totalCount = await Product.countDocuments();
    console.log(req.url);
    console.log("inside getshop");
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const categories = await Category.find();
    const brands = await Brand.find();
    const id = req.params._id
    console.log(id);
    
    if(req.url === "/shop"){
      const products = await Product.find({ Display: "Active" })
      return res.render('user/shop',{user,categories,brands,products,currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      })
    }
    else if(req.url === `/category/${id}`){
      console.log("inside category");
      const products = await Product.find({ Category: id ,Display: "Active" })
      res.render('user/shop',{user,categories,brands,products})
    }else if(req.url === `/brand/${id}`){
      console.log("inside brand");
      const products = await Product.find({ BrandName: id ,Display: "Active" })
      res.render('user/shop',{user,categories,brands,products})
    }
  },

  getProduct: async (req, res) => {
    const _id = req.params._id;
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const product = await Product.find({ _id }).exec();
    if (product) {
      res.render("user/productDescription", {
        user,
        product: product[0],
      });
    }
  },

  getUserLogout: (req, res) => {
    req.session.user = false;
    res.clearCookie("userJwt");
    res.redirect("/login");
  },

  getForgotPassword: async (req, res) => {
    res.render("user/forgotPassword", {
      messages: req.flash(),
      Email: req.session.Email,
    });
  },

  postForgotPassword: async (req, res) => {
    try {
      req.session.Email = req.body.Email;
      const Email = req.body.Email;
      const userData = await User.findOne({ Email: Email });
      if (userData) {
        otpToBeSent = otpFunctions.generateOTP();
        const result = otpFunctions.passwordSendOTP(
          req,
          res,
          Email,
          otpToBeSent
        );
      } else {
        req.flash("error", "Email not registered");
        res.redirect("/forgotpassword");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/login");
    }
  },

  getOtpVerification: async (req, res) => {
    const Email = req.session.Email;
    console.log(Email);
    setTimeout(() => {
      OTP.deleteOne({ Email: Email })
        .then(() => {
          console.log("Document deleted successfully");
        })
        .catch((err) => {
          console.error(err);
        });
    }, 30000);
    res.render("user/otpVerification");
  },

  postOtpVerification: async (req, res) => {
    try {
      const user = await User.findOne({ Email: req.session.Email });
      console.log(user);
      if (user.Status === "Active") {
        const accessToken = jwt.sign(
          { user: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 60 * 60 }
        );
        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });
        req.session.user = user;
        res.redirect("/homepage");
      } else {
        req.flash("error", "error sending otp");
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/login");
    }
  },
  passwordOtpAuth: async (req, res, next) => {
    try {
      let { otp } = req.body;

      // Ensure an OTP record exists for the email
      console.log(req.session.Email);
      const matchedOTPrecord = await OTP.findOne({
        Email: req.session.Email,
      });
      if (!matchedOTPrecord) {
        throw new Error("No OTP records found for the provided email.");
      }

      const { expiresAt } = matchedOTPrecord;

      // Checking for expired codes
      if (expiresAt < Date.now()) {
        await OTP.deleteOne({ Email });
        throw new Error("The OTP code has expired. Please request a new one.");
      }

      console.log(otp);
      const dbOTP = matchedOTPrecord.otp;
      if (otp == dbOTP) {
        req.session.OtpValid = true;
        next();
      } else {
        // Invalid OTP
        console.log("INVALID");
        req.flash("error", "OTP IS INVALID");
        res.redirect("/otpVerification");
      }
    } catch (error) {
      console.error(error);
      res.redirect("/login");
    }
  },
  PasswordResendOtp: async (req, res) => {
    try {
      console.log(req.session.Email);
      const duration = 5;
      const Email = req.session.Email;
      otpToBeSent = otpFunctions.generateOTP();
      console.log(otpToBeSent);
      await OTP.create({
        Email: req.session.Email,
        otp: otpToBeSent,
        createdAt: Date.now(),
        expiresAt: Date.now() + duration * 60000,
      });
      console.log("ivdeee ethi");
      const result = otpFunctions.passwordResendOTP(
        req,
        res,
        Email,
        otpToBeSent
      );
    } catch (error) {
      console.log(error);
      req.flash("error", "error sending OTP");
      res.redirect("/forgotpassword");
    }
  },

  cart: async (req, res) => {
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ UserId: userId }).populate(
      "Items.ProductId"
    );
    console.log(cart);
    res.render("user/cart", { user, cart });
  },

  postCart: async (req,res)=>{
    req.session.totalPrice = req.body.totalPrice;
    res.redirect('/checkout')
  },

  getCheckout: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    res.render('user/checkout',{user})
  },


  postCheckout: async (req,res)=>{
    console.log("inside body",req.body);
     const PaymentMethod = req.body.paymentMethod
     const Address = req.body.Address
     const userId = req.session.user.user;
     const amount = req.session.totalPrice;
     const user = await User.findById(userId);
     const Email = user.Email
     const cart = await Cart.findOne({UserId:userId}).populate("Items.ProductId")
     console.log(req.session.totalPrice);


     const newOrders = new Order({
      UserId: userId,
      Items: cart.Items,
      OrderDate: moment(new Date()).format('llll') ,
      ExpectedDeliveryDate : moment().add(4, 'days').format('llll'),
      TotalPrice: req.session.totalPrice,
      Address: Address,
      PaymentMethod: PaymentMethod
     })
     //delete the items in the cart after checkout  
     await  Cart.findByIdAndDelete(cart._id)
     //save order to database
     const order = await  newOrders.save();
     console.log(order,"in orders");
     req.session.orderId = order._id

     for (const item of order.Items) {
      const productId = item.ProductId;
      const quantity = item.Quantity;
    
      const product = await Product.findById(productId);
    
      if (product) {
        const updatedQuantity = product.AvailableQuantity - quantity;
    
        if (updatedQuantity < 0) {
          product.AvailableQuantity = 0;
      product.Status = "Out of Stock";
        } else {
          // Update the product's available quantity
          product.AvailableQuantity = updatedQuantity;
    
          // Save the updated product back to the database
          await product.save();
        }
      }
    }
    if(PaymentMethod === "cod"){
        //send email with details of orders
     const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: "tickerpage@gmail.com",
        pass: "vfte pvyn gvat uylk",
      },
      secure: true,
    });
    const mailData = {
      from: "tickerpage@gmail.com",
      to: Email,
      subject:'Your Orders!' ,
      text:`Hello! ${user.Username} Your order has been received and will be processed within one business day.`+
      ` your total price is ${req.session.totalPrice}`
    };
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Success");
    });
      res.json({codSuccess:true})
    }else{
      console.log("hereeeeeee");
      const order = {
        amount: amount,
        currency: 'INR',
        receipt: req.session.orderId,
      };
      await razorpay.createRazorpayOrder(order)
      .then ((createdOrder)=>{
        console.log('payment response',createdOrder);
        res.json({createdOrder,order})
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  },

  verifyPayment: async (req, res) => {
    console.log('it is the body',req.body);
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET)
    console.log(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id);
    hmac.update(
      req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id
    )

    hmac = hmac.digest('hex');
    if (hmac === req.body.payment.razorpay_signature) {
      const orderId = new mongoose.Types.ObjectId(req.body.order.createdOrder.receipt)
      console.log('reciept',req.body.order.createdOrder.receipt);
      const updateOrderDocument = await Order.findByIdAndUpdate(
        orderId,
        {
          PaymentStatus: 'Paid',
          PaymentMethod: 'Online'
        }
      )
      console.log('hmac success');
      res.json({success: true})
    } else {
      console.log('hmac failed');
      res.json({failure: true})
    }
  },

  getOrderSucces: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    res.render('user/orderSuccess',{user})
  },

  postAddressForm: async (req,res)=>{
    const userId = req.session.user.user;
    const address = await User.findByIdAndUpdate(userId,{$push:{Address: req.body}},{new: true})
    console.log(address);
    res.redirect('/editAddress')
  },

  addAddressCheckout: async (req,res)=>{
    const userId = req.session.user.user;
    const address = await User.findByIdAndUpdate(userId,{$push:{Address: req.body}},{new: true})
    res.redirect('/checkout')
  },


  getEditAddress: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    console.log(user.Address);
    res.render('user/editAddress',{user})
  },

  postEditAddress: async (req, res) => {
    const addressId = req.params._id;
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    try {
      if (user) {
        const { Name, AddressLane, City, State, Pincode, Mobile } = req.body;
  
        // Find the index of the address in the Address array
        const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);
  
        if (addressIndex !== -1) {
          // Update the fields of the existing address
          user.Address[addressIndex].Name = Name;
          user.Address[addressIndex].AddressLane = AddressLane;
          user.Address[addressIndex].City = City;
          user.Address[addressIndex].State = State;
          user.Address[addressIndex].Pincode = Pincode;
          user.Address[addressIndex].Mobile= Mobile;
  
          // Save the updated user document
          await user.save();
  
          console.log('Address updated successfully');
          req.flash("updated","Address updated successfully")
          res.redirect('/editAddress')
        //   res.status(200).send('Address updated successfully');
        } else {
          console.log('Address not found');
          req.flash("notFound","Address not found")
          res.redirect('/Address')
        //   res.status(404).send('Address not found');
        }
      } else {
        console.log('User not found');
        // res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error updating address:', error.message);
      res.status(500).send('Internal Server Error');
    }
  },

  addToCart: async (req, res) => {
    const userId = req.session.user.user;
    const productId = req.params._id;
    console.log(userId);
    const userCart = await Cart.findOne({ UserId: userId });
    if (userCart) {
      const existingCart = userCart.Items.find((item) =>
        item.ProductId.equals(productId)
      );
      if (existingCart) {
        existingCart.Quantity += 1;
      } else {
        userCart.Items.push({ ProductId: productId, Quantity: 1 });
      }
      await userCart.save();
    } else {
      const newCart = new Cart({
        UserId: userId,
        Items: [{ ProductId: productId, Quantity: 1 }],
      });
      console.log(newCart);
      await newCart.save();
    }
    res.redirect("/cart");
  },

  updatingQuantity: async (req, res) => {
    try {
      const { productId, change } = req.body;

      const userId = req.session.user.user;

      const userCart = await Cart.findOne({ UserId: userId });
      const product = await Product.findById(productId);
      if (!userCart || !product) {
        return res.status(404).json({ error: "Product or cart not found" });
      }
      const cartItem = userCart.Items.find((item) =>
        item.ProductId.equals(productId)
      );
      if (!cartItem) {
        return res.status(404).json({ error: "Product or cart not found" });
      }
      const newQuantity = cartItem.Quantity + parseInt(change);
      if (newQuantity < 1) {
        userCart.Items = userCart.Items.filter(
          (item) => !item.ProductId.equals(productId)
        );
      } else {
        cartItem.Quantity = newQuantity;
      }

      await userCart.save();
      res.json({ message: "Quantity updated successfully", newQuantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  profile: async (req, res) => {
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const orderCount = await Order.countDocuments({UserId: userId});
    const cartCount = await Cart.countDocuments({UserId: userId});
    const addressCount = await User.countDocuments();
    console.log(req.session.user);
    res.render("user/userProfile", { user , orderCount, cartCount, addressCount });
  },

  removeFromCart: async (req, res) => {
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const productId = req.params._id;

    const updatedCart = await Cart.findOneAndUpdate(
      { UserId: user },
      { $pull: { Items: { ProductId: productId } } },
      { new: true }
    );
    console.log("delete : ", updatedCart);
    res.redirect("/cart");
  },


  addAddress: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    res.render('user/addaddress',{user})

  },

  getTrackOrder: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    console.log(userId);
    const orderId = req.session.orderId
    console.log(orderId);
    const order = await Order.findById(orderId)
      .populate('Items.ProductId')
    const addressId = order.Address._id
    const address = await User.findOne({ _id: userId}, {Address: { $elemMatch: { _id: addressId} } })
    console.log(address,"address");
    // console.log(Address,"address");
    res.render("user/trackOrder",{user,order,address})
  },

  getOrderList: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const order = await Order.find({UserId:userId})
    res.render('user/orderList',{user,order})
  },

  getOrderDetails: async (req,res)=>{
    const userId = req.session.user.user;
    const user = await User.findById(userId);
    const orderId=req.params._id;
    const order=await Order.findById(orderId).populate('Items.ProductId')
    const addressId = order.Address._id
    const address = await User.findOne({ _id: userId}, {Address: { $elemMatch: { _id: addressId} } })
    console.log(address,"address");
    console.log(order,'order');
    res.render('user/orderDetails',{user,order,address})
  },

  cancelOrder: async (req,res)=>{
    const orderId = req.params._id;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      // Handle the case where the order with the given ID is not found
      return res.status(404).send('Order not found');
    }

    if (order.Status === 'Order Placed' || order.Status === 'Shipped') {
      order.Status = 'Cancelled';

      await order.save();

      return res.redirect('/orderList');
    } else {
      return res.status(400).send('Order cannot be cancelled');
    }
  } catch (error) {
    console.error('Error cancelling the order:', error);
    return res.status(500).send('Error cancelling the order');
  }
  }
};
