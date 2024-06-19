const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Twilio credentials
const TWILIO_ACCOUNT_SID = 'your_account_sid';
const TWILIO_AUTH_TOKEN = 'your_auth_token';
const TWILIO_PHONE_NUMBER = 'your_twilio_phone_number';

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mtngo'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.use(bodyParser.json());

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
    const { phoneNumber } = req.body;

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP to database
    const insertQuery = 'INSERT INTO users (phone_number, otp) VALUES (?, ?)';
    db.query(insertQuery, [phoneNumber, otp], (err, result) => {
        if (err) {
            console.error('Error saving OTP to database:', err);
            res.status(500).json({ success: false, message: 'Failed to send OTP.' });
        } else {
            // Send OTP via Twilio SMS
            const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
            client.messages
                .create({
                    body: 'Your OTP for login is: ${otp}',
                    from: TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                })
                .then(message => {
                    console.log('OTP sent successfully:', message.sid);
                    res.json({ success: true, message: 'OTP sent successfully.' });
                })
                .catch(error => {
                    console.error('Error sending OTP via Twilio:', error);
                    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
                });
        }
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Check if OTP matches
    const selectQuery = 'SELECT * FROM users WHERE phone_number = ? AND otp = ?';
    db.query(selectQuery, [phoneNumber, otp], (err, result) => {
        if (err) {
            console.error('Error verifying OTP:', err);
            res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
        } else {
            if (result.length > 0) {
                // OTP matched, proceed with login
                res.json({ success: true, message: 'OTP verified successfully. Proceed with login.' });
            } else {
                // OTP didn't match
                res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
            }
        }
    });
});

app.listen(port, () => {
    console.log('Server is running on port ${port}');
});