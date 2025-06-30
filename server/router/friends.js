const express = require("express");
const router = express.Router();
const User = require("../module/user");
const Chat = require("../module/Chat"); 
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized: Please log in" });
}
router.post("/search", async (req, res) => {
  const currentUser = req.user;
  const { sname } = req.body;

  if (!currentUser) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  if (!sname) {
    return res.status(400).json({ message: "Search name is required" });
  }

  // Find users matching the search, excluding self and already-friends
  const users = await User.find({
    username: { $regex: sname, $options: "i" },
    _id: { $ne: currentUser._id, $nin: currentUser.friends }
  }).select("username email");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  // Return the list of possible users to add as friend
  res.json({ message: "Users found", users });
});

// Add friend endpoint: client sends userId to add as friend
router.post("/add-friend", async (req, res) => {
  const currentUser = req.user;
  const { userId } = req.body;

  if (!currentUser) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (userId === currentUser._id.toString()) {
    return res.status(400).json({ message: "Cannot add yourself as a friend" });
  }

  const friend = await User.findById(userId);
  if (!friend) {
    return res.status(404).json({ message: "User not found" });
  }

  // Add each other as friends if not already present
  if (!currentUser.friends.includes(friend._id)) {
    currentUser.friends.push(friend._id);
    await currentUser.save();
  }
  if (!friend.friends.includes(currentUser._id)) {
    friend.friends.push(currentUser._id);
    await friend.save();
  }

  res.json({ message: "Friend added successfully" });
});
  

module.exports = router;