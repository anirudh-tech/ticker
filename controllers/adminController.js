const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const cropImage = require("../utility/imageCrop")
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema");
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
          res.redirect("/admin/dashboard");
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

  getCategoriesAndBrands: async (req, res) => {
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("admin/categoriesAndBrands", { categories, brands });
  },

// brand controller
  

  

  getDashboard: async (req, res) => {
    res.render("admin/dashboard");
  },

  getCount: async (req, res) => {

    try {
      const orders = await Order.find({
        Status: {
          $nin:["returned","Cancelled","Rejected"]
        }
      });
      const orderCountsByDay = {};
      const orderCountsByMonthYear = {};
      const orderCountsByYear = {};
      let labels;
      let data;
      console.log('outside')
      orders.forEach((order) => {
        console.log('inside')
        const orderDate = moment(order.OrderDate, "ddd, MMM D, YYYY h:mm A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        
        if (req.url === "/count-orders-by-day") {
          console.log("count");
          // Count orders by day
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
          } else {
            orderCountsByDay[dayMonthYear]++;
          }
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
          labels = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
          data = ordersByDay.map((entry) => entry.count);
        } else if (req.url === "/count-orders-by-month") {
          // Count orders by month-year
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
          } else {
            orderCountsByMonthYear[monthYear]++;
          }
          const ordersByMonthYear = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          ordersByMonthYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          labels = ordersByMonthYear.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          data = ordersByMonthYear.map((entry) => entry.count);
        } else if (req.url === "/count-orders-by-year") {
          // Count orders by year
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
          } else {
            orderCountsByYear[year]++;
          }
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          labels = ordersByYear.map((entry) =>
            moment(entry._id, "YYYY").format("YYYY")
          );
          data = ordersByYear.map((entry) => entry.count);
        }
      });
      console.log(data);
      console.log(labels)

      res.json({ labels, data });
    } catch (err) {
      console.error(err);
    }
  },

  getOrdersAndSellers: async (req, res) => {
    try {
      const latestOrders = await Order.find().sort({ _id: -1 });
      const bestSeller = await Order.aggregate([
        {
          $unwind: "$Items",
        },
        {
          $group: {
            _id: "$Items.ProductId",
            totalCount: { $sum: "$Items.Quantity" },
          },
        },
        {
          $sort: {
            totalCount: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
      ]);
      if (!latestOrders || !bestSeller) throw new Error("No Data Found");
      res.json({ latestOrders, bestSeller });
    } catch (error) {
      console.log(error);
    }
  },

  getAdminLogout: (req, res) => {
    req.session.admin = false;
    res.clearCookie("adminJwt");
    res.redirect("/admin/login");
  },
};
