const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const moment = require("moment");
const bcrypt = require("bcrypt");
const orderHelper = require("../helpers/orderHelpers")
const jwt = require("jsonwebtoken");

module.exports = {
    getOrderDetails: async (req, res) => {
        try {
          const orderId = req.params._id;
          const orderDetails = await Order.findOne({ _id: orderId }).populate(
            "Items.ProductId"
          );
          res.render("admin/adminOrderDetails", { order: orderDetails });
        } catch (error) {
          console.log(error);
        }
      },
    
      putUpdateStatus: async (req, res) => {
        console.log("hereee");
        const orderId = req.params.orderId;
        const { status } = req.body;
    
        try {
          // Update the order status in the database
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { Status: status },
            { new: true }
          );
    
          // If the status is "Delivered," update the payment status to "paid"
          if (status.toLowerCase() === "delivered") {
            updatedOrder.PaymentStatus = "Paid";
          } else {
            updatedOrder.PaymentStatus = "Pending";
          }
    
          // If the status is "rejected," update the payment status to "order rejected"
          if (status.toLowerCase() === "rejected") {
            updatedOrder.PaymentStatus = "order rejected";
          }
    
          // Save the changes to the order
          await updatedOrder.save();
    
          // Respond with the updated order
          res.json(updatedOrder);
        } catch (error) {
          console.error("Error updating order status:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      },
      getOrders: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;
        const order = await Order.find().skip(skip).limit(perPage).lean();
    
        const totalCount = await Order.countDocuments();
    
        res.render("admin/adminOrders", {
          order,
          currentPage: page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        });
      },
}