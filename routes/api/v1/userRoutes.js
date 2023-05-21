const express = require('express');

const { isUser } = require('./protect');
const userController = require('../../../controllers/api/v1/userController');
const Jobseeker = require('../../../models/jobSeeker');
const Employer = require('../../../models/employer');

// Create a new router instance
const router = express.Router();

// Register a new user
router.post('/register', userController.register); // /api/v1/user/register

// Get current user's information
router.get('/me', isUser, userController.currentUser); // /api/v1/user/me

// Update current user's information
router.put('/me', Jobseeker.uploadResumeMiddleware, isUser, userController.updateUser); // /api/v1/user/me

// Verify user's email
router.get('/verify-email/:token', userController.verifyEmail); // /api/v1/user/verify-email/:token

// Request password reset
router.post('/request-password-reset', userController.requestPasswordReset); // /api/v1/user/request-password-reset

// Validate password reset token
router.get('/validate-reset-token/:token', userController.validateResetToken); // /api/v1/user/validate-reset-token/:token

// Reset user's password
router.post('/reset-password', userController.resetPassword); // /api/v1/user/reset-password

// Export the router instance
module.exports = router;