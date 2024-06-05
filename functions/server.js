const serverless = require('serverless-http');
const app = require('../app');  // Import the app from the root directory

module.exports.handler = serverless(app);
