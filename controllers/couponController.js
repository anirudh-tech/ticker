const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema");
const Coupon = require("../models/couponSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  getCoupon: async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.render("admin/showCoupon", { coupons });
    } catch (error) {
      console.log(error);
    }
  },

  getAddCoupon: async (req, res) => {
    try {
      res.render("admin/addCoupon");
    } catch (error) {}
  },

  postAddCoupon: async (req, res) => {
    try {
      console.log(req.body);
      if (req.body.discountType === "fixed") {
        req.body.amount = req.body.amount[1];
      } else if (req.body.discountType === "percentage") {
        req.body.amount = req.body.amount[0];
      }
      const coupon = await Coupon.create(req.body);
      if (coupon) {
        console.log("added to collection");
      } else {
        console.log("not added to collection");
      }
    } catch (error) {
      console.log(error);
    }
  },

  checkCoupon: async (req, res) => {
    try {
      console.log("inside try");
      const userId = req.session.user.user;
      let code = req.body.code;
      let total = req.body.total;
      let discount = 0;
      const couponMatch = await Coupon.findOne({ couponCode: code });
      if (couponMatch) {
        if (couponMatch.status === true) {
          let currentDate = new Date();
          let startDate = couponMatch.startDate;
          let endDate = couponMatch.endDate;
          if (startDate <= currentDate && currentDate <= endDate) {
            if (couponMatch.applyType === "categories") {
            } else {
              let couponLimit = await Coupon.findOne({
                couponCode: couponMatch.couponCode,
                "usedBy.userId": userId,
              });
              console.log("here is coupon limit", couponLimit);
              if(!couponLimit){
                result = await Coupon.updateOne(
                    { couponCode: couponMatch.couponCode },
                    { $push: { usedBy: { userId, limit: 1 } } }
                  );
              }
              couponLimit = await Coupon.findOne({
                couponCode: couponMatch.couponCode,
                "usedBy.userId": userId,
              });
              const usedByEntry = couponLimit.usedBy.find(entry => entry.userId.toString() === userId.toString());
              let limit
              if (usedByEntry) {
                limit = usedByEntry.limit;
              }
              console.log("after update", limit);
              console.log("after", couponMatch.limit);

              if (limit === couponMatch.limit) {
                return res.json({ error: "Coupon limit exceeded" });
              } else {
                if (couponMatch.couponType === "public") {
                  let result;
                  let usedCoupon = await Coupon.findOne({
                    couponCode: couponMatch.couponCode,
                    "usedBy.userId": userId,
                  });
                  if (!usedCoupon) {
                    result = await Coupon.updateOne(
                      { couponCode: couponMatch.couponCode },
                      { $push: { usedBy: { userId, limit: 1 } } }
                    );
                  } else if (usedCoupon) {
                    result = await Coupon.updateOne(
                      {
                        couponCode: couponMatch.couponCode,
                        "usedBy.userId": userId,
                      },
                      { $inc: { "usedBy.$.limit": 1 } }
                    );
                  } else {
                    return res.json({ error: "You can use only one time" });
                  }
                  if (couponMatch.discountType === "fixed") {
                    console.log("insidee fixedddd");
                    console.log("total", total);
                    if (total >= couponMatch.minAmountFixed) {
                      discount = couponMatch.amount;
                      res.json({ success: true, discount });
                    } else {
                      return res.json({
                        error: `Cart should contain a minimum amount of ${couponMatch.minAmountFixed}`,
                      });
                    }
                  } else {
                    if (total >= couponMatch.minAmount) {
                      discount = total * (couponMatch.minAmount / 100);
                      res.json({ success: true, discount });
                    } else {
                      return res.json({
                        error: `Cart should contain a minimum amount of ${couponMatch.minAmount}`,
                      });
                    }
                  }
                } else {
                  //private coupon
                }
              }
            }
          } else {
            return res.json({ error: "COUPON expired" });
          }
        } else {
          return res.json({ error: "COUPON expired" });
        }
      } else {
        return res.json({ error: "COUPON doesn't exist" });
      }
    } catch (error) {
      console.log(error);
      res.json({ error: "Some error Occurred" });
    }
  },
};

