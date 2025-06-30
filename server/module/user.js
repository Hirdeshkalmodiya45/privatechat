const mongoose = require('mongoose');
   const Schema = mongoose.Schema;
   const passportLocalMongoose = require('passport-local-mongoose');
  const newschema =new Schema({
   
    email: { type: String, required: true, unique: true },
friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  imgurl: { type: String, default: "https://images.unsplash.com/photo-1622860686767-032799edeb1d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
    createdAt: { type: Date, default: Date.now }
  }); 
  newschema.plugin(passportLocalMongoose);
   
  const User = mongoose.model('User', newschema);
  module.exports = User;      



    