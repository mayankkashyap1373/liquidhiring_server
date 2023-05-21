const express = require('express');

// Create a new router instance
const router = express.Router();

// Auth-related routes
router.use('/auth', require('./authRoutes')); // /api/v1/auth

// User-related routes
router.use('/user', require('./userRoutes')); // /api/v1/user

// Jobseeker-related routes
router.use('/jobseeker', require('./jobseekerRoutes')); // /api/v1/jobseeker

// Employer-related routes
router.use('/employer', require('./employerRoutes')); // /api/v1/employer

// Job-related routes
router.use('/job', require('./jobRoutes')); // /api/v1/job

// ChatGPT-related routes
router.use('/chatgpt', require('./chatGPTRoutes')); // /api/v1/chatgpt

// Export the router instance
module.exports = router;