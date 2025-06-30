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

// Endpoint to get chat messages between two users
router.post("/messages", ensureAuthenticated, async (req, res) => {
    const { fuser_id } = req.body;

    if (!fuser_id) {
        return res.status(400).json({ message: "Friend user ID is required" });
    }

    try {
        const senderId = req.user._id;
        const receiverId = fuser_id;

        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Sender or receiver user not found" });
        }

        const receiverusername = receiver.username || "Unknown";

        // Normalize the participants
        const participants = [senderId.toString(), receiverId.toString()].sort();

        // Find chat document and populate message senders
        const chat = await Chat.findOne({ participants })
            .populate("messages.sender", "username");

        if (!chat) {
            return res.json({
                message: "No chat found between these users",
                messages: [],
                receiverusername,
            });
        }

        // Sort messages by timestamp (in-memory sort)
        const sortedMessages = chat.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        res.json({
            message: "Chat messages retrieved successfully",
            messages: sortedMessages,
            receiverusername,
        });

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});

router.post("/deleteAll", ensureAuthenticated, async (req, res) => {
    const { fuser_id } = req.body;

    if (!fuser_id) {
        return res.status(400).json({ message: "Friend user ID is required" });
    }

    try {
        const senderId = req.user._id;
        const receiverId = fuser_id;

        // Normalize the participants
        const participants = [senderId.toString(), receiverId.toString()].sort();

        // Find chat document
        const chat = await Chat.findOne({ participants });

        if (!chat) {
            return res.status(404).json({ message: "No chat found between these users" });
        }

        // Clear messages
        chat.messages = [];
        await chat.save();

        res.json({ message: "All messages deleted successfully" });

    } catch (error) {
        console.error("Error deleting messages:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});

module.exports = router;