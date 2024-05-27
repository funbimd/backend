const twilio = require("twilio");
const db = require("../backend/Database");

// Function to generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Function to send OTP via Twilio
async function sendOtpViaTwilio(phoneNumber, otp) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  return client.messages.create({
    body: `Your OTP for login is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}

exports.login = (req, res) => {
  const { phoneNumber } = req.body;

  // Generate a random 6-digit OTP
  const otp = generateOTP();

  // Save OTP to database
  const insertQuery = "INSERT INTO users (phone_number, otp) VALUES (?, ?)";

  db.query(insertQuery, [phoneNumber, otp], async (err, result) => {
    if (err) {
      console.error("Error saving OTP to database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save OTP." });
    }

    try {
      const message = await sendOtpViaTwilio(phoneNumber, otp);
      console.log("OTP sent successfully:", message.sid);
      res.json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
      console.error("Error sending OTP via Twilio:", error);
      res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
  });
};

exports.loginVerify = (req, res) => {
  const { phoneNumber, otp } = req.body;

  const selectQuery = "SELECT * FROM users WHERE phone_number = ? AND otp = ?";

  db.query(selectQuery, [phoneNumber, otp], (err, result) => {
    if (err) {
      console.error("Error verifying OTP:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to verify OTP." });
    }

    if (result.length > 0) {
      // OTP matched, proceed with login
      res.json({
        success: true,
        message: "OTP verified successfully. Proceed with login.",
      });
    } else {
      // OTP didn't match
      res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }
  });
};
