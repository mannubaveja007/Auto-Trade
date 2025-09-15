const serverless = require('serverless-http');
const { createApp } = require('./app');

const app = createApp();

// Export the serverless function
module.exports.handler = serverless(app);