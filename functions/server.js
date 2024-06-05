// functions/server.js
const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Your Express routes here
app.get('/api/hello', (req, res) => {
  res.send('Hello, world!');
});

module.exports.handler = serverless(app);
