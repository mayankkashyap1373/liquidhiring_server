const express = require('express');
const jobController = require('../../../controllers/api/v1/jobController');
const { isUser } = require('./protect');

// Create a new router instance
const router = express.Router();

// Get all jobs
router.get('/', jobController.getAllJobs); // /api/v1/job

// Get a specific job by ID
router.get('/:id', isUser, jobController.getJob); // /api/v1/job/:id

// Search for jobs
router.get('/search', isUser, jobController.searchJobs); // /api/v1/job/search

router.get('/featured', jobController.getFeaturedJobs); // /api/v1/job/featured

// Export the router instance
module.exports = router;