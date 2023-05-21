const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/api/v1/authController');
const { isUser } = require('./protect');

// User login
router.post('/login', authController.login); // /api/v1/auth/login

// User logout
router.post('/logout', isUser, authController.logout); // /api/v1/auth/logout

// Export the router instance
module.exports = router;