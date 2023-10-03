const User = require("../models/userSchema");
const OTP = require("../models/otpSchema");
const otpFunctions = require("../utility/otpFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const flash  = require("express-flash");
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
    res.render("user/emailVerification", { messages: req.flash() });
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
      res.redirect("/signup");
    }
  },

  resendOtp: async (req, res) => {
    try {
      console.log(req.session.user.user);
      const matchedOTPrecord = await OTP.findOne({
        _id: req.session.user.user,
      });
      console.log(req.session.user.Email);
      if (matchedOTPrecord) {
        const duration = 5;
        const Email = req.session.user.Email;
        otpToBeSent = otpFunctions.generateOTP();
        console.log(otpToBeSent);
        await OTP.updateOne(
          { Email: Email },
          {
            otp: otpToBeSent,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration * 60000,
          }
        );
        console.log("ivdeee ethi");
        const result = otpFunctions.resendOTP(req, res, Email, otpToBeSent);
      }
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
      }else{
        req.flash("error","You have been banned")
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "invalid username or password");
      res.redirect("/login");
    }
  },

  home: async (req, res) => {
    const categories = await Category.find()
    const products = await Product.find( {Display:"Active"}).sort({_id: -1}).limit(8)
    console.log(categories);
    console.log(products);
    res.render("user/homepage", {
      user: req.session.user,
      products,
      categories,
    });
  },

  getProduct: async (req, res) => {
    const _id = req.params._id;
    const product = await Product.find({ _id }).exec();
    if (product) {
      res.render("user/productDescription", {
        user: req.session.user,
        product: product[0],
      });
    }
  },

  getUserLogout: (req, res) => {
    req.session.user = false;
    res.clearCookie("userJwt");
    res.redirect("/login");
  },


  getForgotPassword: async (req,res)=>{
    res.render('user/forgotPassword',{messages:req.flash(),Email:req.session.Email})
  },

  postForgotPassword: async (req,res)=>{
    try {
      req.session.Email = req.body.Email
      const Email = req.body.Email
      const userData = await User.findOne({Email:Email})
      if(userData){
        otpToBeSent = otpFunctions.generateOTP();
        const result = otpFunctions.passwordSendOTP(req, res, Email, otpToBeSent);
      }else{
        req.flash("error","Email not registered")
        res.redirect('/forgotpassword')
      }
    } catch (error) {
      console.log(error);
      res.redirect('/login')
    }
  },

  getOtpVerification: async (req,res)=>{
    const Email = req.session.Email
    console.log(Email)
    setTimeout(()=>{
      OTP.deleteOne({Email:Email})
        .then(() => {
          console.log("Document deleted successfully");
        })
        .catch((err) => {
          console.error(err);
        })
    },30000)
    res.render('user/otpVerification')
  },

  postOtpVerification: async (req,res)=>{
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
      }
     catch (error) {
      console.log(error)
      res.redirect('/login')
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
        await OTP.create(
          {
            Email: req.session.Email,
            otp: otpToBeSent,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration * 60000,
          }
        );
        console.log("ivdeee ethi");
        const result = otpFunctions.passwordResendOTP(req, res, Email, otpToBeSent);
    } catch (error) {
      console.log(error);
      req.flash("error", "error sending OTP");
      res.redirect("/forgotpassword");
    }
  },
};
