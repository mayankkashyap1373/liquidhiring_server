// Path: controllers/api/v1/chatGPTController.js

const User = require('../../../models/user');
const Jobseeker = require('../../../models/jobSeeker');
const chatGPTProcessor = require('../../../queueProcessors/chatGPTProcessor');

// Path: controllers/api/v1/chatGPTController.js

exports.suggestResume = async (req, res) => {
    console.log('Request body', req.body);
    try {
        // Adding job to the queue
        const job = await chatGPTProcessor.add({
            email: req.body.email,
        });

        // If the job was added successfully, send a success response
        if (job) {
            res.status(200).json({ status: 'success', message: 'Job added successfully' });
        } else {
            res.status(500).json({ status: 'error', message: 'Failed to add job' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', error: error });
    }
};