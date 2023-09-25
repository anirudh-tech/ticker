const mongoose = require('mongoose');

const { Schema} = mongoose;

const UsersSchema = new Schema({
  Username: { type: String },
  Email: { type: String },
  Passsword: { type: String },
  Mobile: { type: String },
  Status: { type: String },
  
  Orders: [{
     ObjectId: { type: Schema.Types.ObjectId },
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

module.exports =  mongoose.model('User', UsersSchema);

