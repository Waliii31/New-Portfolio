const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

// Load environment variables
require('dotenv').config();

const gmailAddress = process.env.GMAIL_ADDRESS;
const appPassword = process.env.APP_PASSWORD;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  res.render('index');
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailAddress,
    pass: appPassword
  }
});

app.post('/process_form', (req, res) => {
  const { name, subject, email, message } = req.body;

  if (!name || !email || !message || !subject) {
    return res.status(400).send('Please fill out all fields.');
  }

  const mailOptions = {
    from: email,
    to: gmailAddress,
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error sending email.');
    }

    console.log('Email sent: %s', info.messageId);
    res.render('submitted');
  });
});

app.listen(3002, () => {
  console.log('Server is running on port 3002');
});
