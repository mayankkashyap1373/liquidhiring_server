const express = require('express');

const { isUser, isJobseeker } = require('./protect');
const Jobseeker = require('../../../models/jobSeeker');

const router = express.Router();
const jobSeekerController = require('../../../controllers/api/v1/jobSeekerController');
const jobSeeker = require('../../../models/jobSeeker');

// Protect all routes in this router with the isJobseeker middleware
router.use(isJobseeker);

// Update jobseeker resume
router.post('/uploadResume', jobSeekerController.uploadResume); // /api/v1/jobseeker/uploadResume

// router.post('/me/uploadAvatar', jobSeeker.profilePictureMiddleware, jobSeekerController.uploadAvatar); // /api/v1/jobseeker/me/uploadAvatar

// Apply for a job
router.post('/jobs/:id/apply', jobSeekerController.applyJob); // /api/v1/jobseeker/jobs/:id/apply

// Get all applied jobs
router.get('/jobs/applied', jobSeekerController.getAppliedJobs); // /api/v1/jobseeker/jobs/applied

// Check if a job is applied
router.get('/jobs/:id/check', jobSeekerController.checkAppliedJob); // /api/v1/jobseeker/jobs/:id/check

// Additional jobseekerRoutes (currently commented out)
// router.post('/jobs/:id/bookmark', jobSeekerController.bookmarkJob); // /api/v1/jobseeker/jobs/:id/bookmark
// router.get('/jobs/bookmarked', jobSeekerController.getBookmarkedJobs); // /api/v1/jobseeker/jobs/bookmarked
// router.get('/jobs/recommended', jobSeekerController.getRecommendedJobs); // /api/v1/jobseeker/jobs/recommended

module.exports = router;