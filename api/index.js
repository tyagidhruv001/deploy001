const app = require("../backend/src/app");

// This wrapper ensures that Vercel finds the Express app
// and we can add some logging to debug if needed.
console.log("API bridge initialized");

module.exports = app;
