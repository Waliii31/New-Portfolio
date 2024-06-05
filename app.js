const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const projects = require("./models/project");
const path = require('path');
const app = express();

// Load environment variables
require('dotenv').config();

const gmailAddress = process.env.GMAIL_ADDRESS;
const appPassword = process.env.APP_PASSWORD;
const gmailPassword = process.env.GMAIL_PASSWORD;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/adminLogin');
  }
}

app.get('/', async (req, res) => {
  const project = await projects.find();
  res.render('index', { project });
});

app.get('/adminLogin', (req, res) => {
  const user = { email: '', password: '' };
  res.render('adminLogin', { user });
});

app.post('/adminLogin', (req, res) => {
  const { email, password } = req.body;
  if (email === gmailAddress && password === gmailPassword) {
    req.session.user = { email };
    res.redirect('/adminPanel');
  } else {
    res.render('adminLogin', { user: { email, password: '' }, error: 'Invalid email or password' });
  }
});

app.get('/adminPanel', isAuthenticated, (req, res) => {
  res.render('adminPanel');
});

app.post('/', isAuthenticated, async (req, res) => {
  const { name, description, image, webLink } = req.body;
  const newProject = new projects({ name, description, image, webLink });
  await newProject.save();
  res.redirect('/');
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

// Do not start the server here when running on Netlify
// app.listen(3000, () => {
//   console.log('Server is running on port 3001');
// });

module.exports = app;  // Export the app for serverless usage
