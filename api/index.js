// Vercel Serverless Function entry point for SafeHer API
const app = require('../server/dist/server.js').default || require('../server/dist/server.js');

module.exports = app;

