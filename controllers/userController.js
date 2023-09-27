const User = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const otpFunctions = require('../utility/otpFunctions')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const flash = require('express-flash')
module.exports = {



//signup get
  getUserSignup: (req, res) => {
    res.render("user/sign-up",{error:req.session.error});
  },
  
  postUserSignup: async (req,res)=>{
    try {
      const salt = await bcrypt.genSalt();
      req.body.Password = await bcrypt.hash(req.body.Password,salt);
      const user = req.body
      const Email = req.body.Email
      req.session.user = user
      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        req.session.error = 'Email already taken'
      // Email already exists, send an error message or handle it as needed
      res.redirect('/signup')
    }else{
      otpToBeSent = otpFunctions.generateOTP()
      const result = otpFunctions.sendOTP(req, res, Email, otpToBeSent)
    }
    } catch (error) {
      console.log(error);
        res.redirect('/signup')
      }
  },

  getEmailVerification: async(req,res)=>{
    res.render('user/emailVerification')
  },

  otpAuth: async (req, res, next) => {
    try {
        let { otp } = req.body;
        let { Email} = req.session.user

        // Ensure an OTP record exists for the email
        console.log(Email)
        const matchedOTPrecord = await OTP.findOne({ Email });

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
        const dbOTP = matchedOTPrecord.otp
        if (otp == dbOTP) {
            req.session.OtpValid = true;
            next()
        } else {
            // Invalid OTP
            req.session.error = "The OTP is invalid.";
            console.log("INVALIIIIIIEDD");
            req.flash('error', "OTP IS INVALID")
            res.redirect('/emailVerification');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/signup')
    }
  },

  //email verification
  postEmailVerification: async(req,res)=>{
    try {
      const userData = await User.create(req.session.user)

      if (userData) {
        const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
    
        res.redirect('/homepage')
    }
    } catch (error) {
      res.redirect('/signup')
    }
  },

  getUserLogin:(req,res)=>{
    res.render("user/log-in")
  },

  postUserLogin: async (req,res)=>{
    try {
      const user = await User.findOne({Email:req.body.Email})
      if(user){
        const passwordMatch = await bcrypt.compare(
          req.body.Password,
          user.Password
        )
        if(passwordMatch){
          const accessToken = jwt.sign({ user: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
        req.session.user = user
        res.redirect('/homepage')
        }else{
          req.session.error = "Invalid username or Password"
          res.redirect('/login')
        }
      }else{
        req.session.error = "Invalid username or Password"
          res.redirect('/login')
      } 
    } catch (error) {
      console.log(error);
      req.session.error = "Invalid username or Password"
      res.redirect('/login')
      
    }
  },

  home:(req,res)=>{
    res.render("user/homepage",{user:req.session.user})
  },

  description:(req,res)=>{
    res.render("user/productDescription",{user:req.session.user})
  },
};
