const express = require("express");
const router = express.Router();

const port = process.env.PORT || 3000;
const loginController = require("../Controller/loginController");

// Endpoint to send OTP
router.post("/send-otp", loginController.login);

// Endpoint to verify OTP
router.post("/verify-otp", loginController.loginVerify);

module.exports = router;
