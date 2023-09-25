const User = require('../models/userSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
module.exports = {
  signup: (req, res) => {
    res.render("user/sign-up");
  },
  insertuser: async (req,res)=>{
    
  },
  verification: (req, res) => {
    res.render("user/emailVerification");
  },
  login:(req,res)=>{
    res.render("user/log-in")
  },
  home:(req,res)=>{
    res.render("user/homepage")
  },
  description:(req,res)=>{
    res.render("user/productDescription")
  },
  token : jwt.sign
};
