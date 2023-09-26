const User = require('../models/userSchema')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
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
      req.session.user = user
      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        req.session.error = 'Email already taken'
      // Email already exists, send an error message or handle it as needed
      res.redirect('/signup')
    }else{
      res.redirect('/emailVerification')
    }
    } catch (error) {
        res.redirect('/signup')
      }
  },

  //email verification
  getEmailVerification: (req, res) => {
    const {Email} = req.session.user
    const transporter = nodemailer.createTransport({
      port: 465,               // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
          user: 'tickerpage@gmail.com',
          pass: 'vfte pvyn gvat uylk'
      },
      secure: true,
  });
  const mailData = {
      from: 'tickerpage@gmail.com',  // sender address
      to: Email,   // list of receivers
      subject: 'Sending OTP',
      text: 'hello'
  }
  transporter.sendMail(mailData, (error, info) => {
      if (error) {
          return console.log(error)
      }
      console.log('successs');
  })
    res.render("user/emailVerification");
  },

  postEmailVerification: async(req,res)=>{
    try {
      const userData = await User.create(req.session.user)

      if (userData) {
        const accessToken = jwt.sign({ user: userData._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 })
        res.render('user/landingPage', { user: true })
    }
    } catch (error) {
      res.redirect('/signup')
    }
  },

  login:(req,res)=>{
    res.render("user/log-in")
  },

  home:(req,res)=>{
    res.render("user/homepage",{user:req.session.user})
  },

  description:(req,res)=>{
    res.render("user/productDescription",{user:req.session.user})
  },
  token : jwt.sign
};
