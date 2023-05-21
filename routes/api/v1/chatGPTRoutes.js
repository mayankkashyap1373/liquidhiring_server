// Path: routes/api/v1/chatGPTRoutes.js

const express = require('express');

const { isJobseeker } = require('./protect');

const chatGPTController = require('../../../controllers/api/v1/chatGPTController');

const router = express.Router();

// Suggest improvements to resume
router.post('/suggest', isJobseeker, chatGPTController.suggestResume); // /api/v1/chatgpt/suggest

// Export the router instance
module.exports = router;