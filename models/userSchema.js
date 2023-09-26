const mongoose = require('mongoose');



const schema = mongoose.Schema({
  Username: { type: String, required: true },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Mobile: { type: String },
  Status: { type: String },
  
  Orders: [{
     ObjectId: { type: String},
  }],
  Address: [{
     AddressLane: { type: String },
     Country: { type: String },
     Pincode: { type: String },
     State: { type: String },
  }],
  Cart: [{
  }],
});

module.exports =  mongoose.model('UserData', schema);

