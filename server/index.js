const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const multer  = require('multer')
const User = require("./module/user"); // Ensure this uses passport-local-mongoose
const Chat = require("./module/Chat"); // Import the Chat model
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Required for cookie-based sessions
  })
);
app.use(express.static('public'));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // public folder ke andar uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  }
});

const upload = multer({ storage: storage });
// Session configuration
app.use(
  session({
    secret: "keyboard cat",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day 
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: false, // Set to true if using HTTPS  
    },
    rolling: true, // Resets the cookie expiration on each request  
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport-local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const dotenv = require("dotenv"); // Import dotenv to load environment variables
// Load environment variables from .env file  
dotenv.config();  
// Ensure the User model is configured with passport-local-mongoose

// MongoDB connection
const dbURI = process.env.DBURL;
 // Log the connection URI for debugging
mongoose
  .connect(dbURI, {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});


// Search users by username, but let client choose which user to add as friend

const friendsRouter = require("./router/friends");  


// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Please log in" });
}

app.post("/currentuser/friends", async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    // Populate friends with user details
    const currentUser = await User.findById(req.user._id).populate("friends", "username email imgurl");


    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
console.log("🚀 Route called once");
   const rawFriends = currentUser.friends || [];
const friends = rawFriends.map(f => f.toObject()); // ✅ Plain JS objects

for (const friend of friends) {
  const participants = [req.user._id.toString(), friend._id.toString()].sort();
  const chat = await Chat.findOne({ participants });
           
  if (chat && chat.messages.length > 0) {
    const lastMessage = chat.messages[chat.messages.length - 1];
                                                                 

    // Fix: use correct message field name (e.g. `text` instead of `message`)
    friend.lastMessage = lastMessage?.message || null;
    friend.lastMessagetime =lastMessage?.timestamp;
     // Add sender info
  } else {
    friend.lastMessage = null;
  }
}
friends.sort((a, b) => {
  // If either lastMessagetime is missing, treat as oldest
  if (!a.lastMessagetime && !b.lastMessagetime) return 0;
  if (!a.lastMessagetime) return 1;
  if (!b.lastMessagetime) return -1;
  return new Date(b.lastMessagetime) - new Date(a.lastMessagetime);
});

console.log(friends); 
    res.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Error fetching friends", error });
  }
});
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  // Join a room for each user by their userId
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    }
  });

  socket.on("chatMessage", async ({ message, senderId, receiverId }) => {
    if (!message || !senderId || !receiverId) return;

    try {
      const participants = [senderId.toString(), receiverId.toString()].sort();

      // Find existing chat or create new one
      let chat = await Chat.findOne({ participants });
      const chatMessage = {
        sender: senderId,
        message,
        timestamp: new Date()
      };

      if (chat) {
        chat.messages.push(chatMessage);
        await chat.save();
      } else {
        chat = new Chat({
          participants,
          messages: [chatMessage]
        });
        await chat.save();
      }

      // Emit message to receiver (if online)
      io.to(receiverId).emit("chatMessage", chatMessage);

      // Optionally, also emit back to sender
      socket.emit("chatMessage", chatMessage);

    } catch (error) {
      console.error("Error storing chat message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});



app.post('/upload', upload.single('image'), async(req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  // filePath ab public/uploads/filename.jpg ke format me hoga
  console.log("File uploaded successfully:", filePath); 
  const currentUser = req.body.username; // req.user se current user milta hai agar user login hai

  if (!currentUser) {
    console.log("No user is logged in");
    return res.status(404).json({ message: "User not found" });
  } 
  // Fetch the user from the database and update imgurl
  const user = await User.findOne({ username: currentUser });
  // ya aap user ko req.user se bhi le sakte ho agar user login hai 
  if (!user) {
    return res.status(404).json({ message: "User not found in database" });
  }
  user.imgurl = filePath; // ya aap imgurl ko kisi aur field me bhi store kar sakte ho
  await user.save();   

  // Yaha aap user ki imgurl ko update kar rahe ho  
  // Aap yeh path client ko bhej sakte ho ya database me save kar sakte ho

  res.json({ imageUrl: filePath });
});





// Replace app.listen with server.listen to support socket.io
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});







const axios = require("axios");

// const apiKey = 'a9407126-e46b-4e68-9bd8-febbbe2034e5';
const apikey ='fa7664588a844a28850ba11abfffcd3d';
// Backend route: /check-email
const user=require("./router/user");
const chat = require("./router/chat");  
app.use("/user", user); 
app.use("/chat", chat);
app.use("/friends", friendsRouter); // Use the friends router

// Socket.io setup for real-time communication                  

const userSocketMap = {}; // Map userId to socket.id

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on("offer", ({ to, offer, from }) => {
    io.to(userSocketMap[to]).emit("offer", { offer, from });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(userSocketMap[to]).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(userSocketMap[to]).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    // Clean up if needed
  });
});








// Start server
// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });
