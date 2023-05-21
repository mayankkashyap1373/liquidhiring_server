const express = require('express');

// Create a new router instance
const router = express.Router();

// Use the version 1 routes
router.use('/v1', require('./v1'));

// Export the router instance
module.exports = router;