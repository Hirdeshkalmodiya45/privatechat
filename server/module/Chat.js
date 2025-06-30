const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  participants: [String], // Sorted sender/receiver ids
  messages: [messageSchema] // Array of messages
});

module.exports = mongoose.model("Chat", chatSchema);
