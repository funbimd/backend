const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// Replace with your MySQL connection details
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mtngo',
});

// Function to generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Login route - sends OTP
app.post('/login', (req, res) => {
  const { phone } = req.body;

  // Check if phone number exists in database (optional)
  connection.query('SELECT * FROM users WHERE phone = ?', [phone], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    // Insert or update OTP record in database
    connection.query('INSERT INTO otp (phone, otp, expiry) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expiry = ?', [phone, otp, expiry, otp, expiry], (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Send OTP via SMS using a service like Twilio (integration not included here)
      console.log('OTP for ${phone} is ${otp}'); // Replace with actual SMS sending logic
      res.json({ message: 'OTP sent successfully' });
    });
  });
});

// OTP verification route
app.post('/verify', (req, res) => {
  const { phone, enteredOtp } = req.body;

  connection.query('SELECT * FROM otp WHERE phone = ?', [phone], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!results.length) {
      return res.status(400).json({ message: 'Invalid phone number or expired OTP' });
    }

    const { otp, expiry } = results[0];
    if (enteredOtp !== otp || Date.now() > expiry) {
      return res.status(401).json({ message: 'Incorrect OTP' });
    }

    // Successful verification (replace with logic for user login or JWT generation)
    connection.query('DELETE FROM otp WHERE phone = ?', [phone], (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: 'Login successful!' });
    });
  });
});

app.listen(port, () => console.log('Server listening on port ${port}'));

// Remember to create tables 'users' and 'otp' in your MySQL database with appropriate columns