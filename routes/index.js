const express = require('express');

// Create a new router instance
const router = express.Router();

// Use the API routes
router.use('/api', require('./api'));

// Export the router instance
module.exports = router;