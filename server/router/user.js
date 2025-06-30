const express = require("express");
const router = express.Router();
const axios = require("axios");
const passport = require("passport");

const apikey = 'fa7664588a844a28850ba11abfffcd3d';
const User = require("../module/user");

router.get("/check-email", async (req, res) => {
    const email = req.query.email;

    try {
        const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${apikey}&email=${email}`);
        const result = response.data;
       
    const deliverability = result.deliverability;
    const isDeliverable = deliverability === "DELIVERABLE";
    const isDisposable = result.is_disposable_email?.value || false;
    const smtpValid = result.is_smtp_valid?.value || false;
    const isFree = result.is_free_email?.value || false;
    const isRole = result.is_role_email?.value || false;

    res.json({
      valid: isDeliverable && smtpValid && !isDisposable,
      reason: deliverability,
      is_disposable: isDisposable,
      is_free_email: isFree,
      is_role_email: isRole,
      smtp_check: smtpValid,
      provider: result.mx?.records?.[0]?.exchange || "Unknown"
    });

    } catch (err) {
        res.status(500).json({ valid: false, error: "API request failed" });
    }
});

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email });
        await User.register(user, password);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        if (error.name === "UserExistsError") {
            res.status(409).json({ message: "User already exists" });
        } else {
            res.status(500).json({ message: "Error creating user", error });
        }
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Authentication error", error: err });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Login failed", error: err });
            }
            res.locals.user = user;
            return res.json({ success: true, message: "Login successful", user });
        });
    })(req, res, next);
});

router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed", error: err });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logout successful" });
    });
});

module.exports = router;
