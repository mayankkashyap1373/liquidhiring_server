const express = require('express');

const { isEmployer } = require('./protect');
const employerController = require('../../../controllers/api/v1/employerController');
const Employer = require('../../../models/employer');

// Create a new router instance
const router = express.Router();

// Protect routes with isEmployer middleware
router.use(isEmployer);

// router.post('/uploadLogo', Employer.profilePictureMiddleware, employerController.uploadLogo); // /api/v1/employer/uploadLogo

// Create a new job
router.post('/jobs', employerController.createJob); // /api/v1/employer/jobs

// Update a job
router.put('/jobs/:id', employerController.updateJob); // /api/v1/employer/jobs/:id

// Delete a job
router.delete('/jobs/:id', employerController.deleteJob); // /api/v1/employer/jobs/:id

// Get employer's jobs
router.get('/jobs', employerController.getEmployerJobs); // /api/v1/employer/jobs

// Get candidates for a job
router.get('/jobs/:id/candidates', employerController.getJobCandidates); // /api/v1/employer/jobs/:id/candidates

// Export the router instance
module.exports = router;