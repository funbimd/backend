const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const loginRouter = require("./routes/loginRoute");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/login", loginRouter);
// Endpoint to send OTP
// app.post("/send-otp", (req, res) => {
//   const { phoneNumber } = req.body;

//   // Generate a random 6-digit OTP
//   const otp = Math.floor(100000 + Math.random() * 900000);

//   // Save OTP to database
//   const insertQuery = "INSERT INTO users (phone_number, otp) VALUES (?, ?)";
//   db.query(insertQuery, [phoneNumber, otp], (err, result) => {
//     if (err) {
//       console.error("Error saving OTP to database:", err);
//       return res
//         .status(500)
//         .json({ success: false, message: "Failed to save OTP." });
//     }

//     // Send OTP via Twilio SMS
//     const client = twilio(
//       process.env.TWILIO_ACCOUNT_SID,
//       process.env.TWILIO_AUTH_TOKEN
//     );
//     client.messages
//       .create({
//         body: `Your OTP for login is: ${otp}`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: phoneNumber,
//       })
//       .then((message) => {
//         console.log("OTP sent successfully:", message.sid);
//         res.json({ success: true, message: "OTP sent successfully." });
//       })
//       .catch((error) => {
//         console.error("Error sending OTP via Twilio:", error);
//         res
//           .status(500)
//           .json({ success: false, message: "Failed to send OTP." });
//       });
//   });
// });

// Endpoint to verify OTP
// app.post("/verify-otp", (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   // Check if OTP matches
//   const selectQuery = "SELECT * FROM users WHERE phone_number = ? AND otp = ?";
//   db.query(selectQuery, [phoneNumber, otp], (err, result) => {
//     if (err) {
//       console.error("Error verifying OTP:", err);
//       return res
//         .status(500)
//         .json({ success: false, message: "Failed to verify OTP." });
//     }

//     if (result.length > 0) {
//       // OTP matched, proceed with login
//       res.json({
//         success: true,
//         message: "OTP verified successfully. Proceed with login.",
//       });
//     } else {
//       // OTP didn't match
//       res
//         .status(400)
//         .json({ success: false, message: "Invalid OTP. Please try again." });
//     }
//   });
// });

app.listen(port, () => {
  console.log("Server is running on port ${port}");
});
module.exports = app;
