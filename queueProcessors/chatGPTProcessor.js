// Path: queueProcessors/chatGPTProcessor.js

const Queue = require('bull');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');
const openaiService = require('../helpers/openaiService');
const User = require('../models/user');
const Jobseeker = require('../models/jobSeeker');
const db = require('../config/mongoose');

const chatGPTProcessingQueue = new Queue('chatGPTProcessing');

chatGPTProcessingQueue.process(async (job) => {
    console.log('Processing chatGPT');
    const { email } = job.data;
    let suggestions;
    try {
        job.progress(0); // Starting the job.

        const user = await User.findOne({ email });
        console.log('User: ', user);
        job.progress(20); // User found (20% completion, assumed to be a quicker task)

        const jobSeeker = await Jobseeker.findOne({ user: user._id }).populate('user');
        console.log('JobSeeker: ', jobSeeker);
        job.progress(50); // JobSeeker found (50% completion, assumed to be a longer task)

        let prompt = jobSeeker.resumeTokens.map(token => `${token.content}:${token.pos}`).join('\n');
        // Add jobSeeker.resumeTokens to prompt
        

        console.log('Prompt: ', prompt);
        job.progress(70); // Prompt created (70% completion, quicker task)

        suggestions = await openaiService.generate(prompt);
        suggestions = suggestions.content;
        console.log('Suggestions: ', suggestions);
        job.progress(90); // Suggestions generated (90% completion, longer task)

        // some finalization work...
        job.progress(100); // Job is fully completed.

        return suggestions;
    } catch (error) {
        console.log(error);
        return { status: 'error', error: handleError(error) };
    }
});

module.exports = chatGPTProcessingQueue;
