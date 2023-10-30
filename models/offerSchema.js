const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const OfferSchema = new Schema({
    categoryName: String,
    offerPrice: Number,
    expiryDate: Date
})