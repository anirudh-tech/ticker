const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const Userschema = new Schema({
  Username: { type: String, required: true },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Status: { type: String ,default:"Active"},
  
  Orders: [{
  }],
  Address: [{
     Name: {type: String},
     AddressLane: { type: String },
     City: { type: String },
     Pincode: { type: Number },
     State: { type: String },
     Mobile: { type: Number },
  }],
  Cart: [{
  }],
});
const User =  mongoose.model('UserData', Userschema);
module.exports = User

