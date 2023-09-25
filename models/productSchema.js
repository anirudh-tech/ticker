const mongoose = require('mongoose');

const {Schema} = mongoose;

const ProductsSchema = new Schema({
  Name: { type: String, required: true },
  Description:{type:String,required:true},
  Specification: { type: String, required: true },
  Variation: { type: String, required: true },
  Images: [{ type: String, required: true,  }],
  Review: { type: String },
  Stock: { type: Number, required: true },
  Rating: { type: String },
  TimeStamp: { type: Date },
});

module.exports = mongoose.model('Products', ProductsSchema);

