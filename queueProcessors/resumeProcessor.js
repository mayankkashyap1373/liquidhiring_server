// Path: queueProcessors/resumeProcessor.js

const Queue = require('bull');
const { storage, bucketName, processDocument, analyzeText } = require('../helpers/googleCloudServices');
const path = require('path');
const fs = require('fs');
const resumeProcessingQueue = new Queue('resumeProcessing');
const db = require('../config/mongoose');
const Jobseeker = require('../models/jobSeeker');
const User = require('../models/user');

resumeProcessingQueue.process(async (job) => {
    console.log('Processing resume');
    const { userId, filePath, newFilename } = job.data;
    // The same logic from the updateUser function
    async function uploadFile(storage, bucketName, filePath, newFilename) {
        const bucket = storage.bucket(bucketName);
        await bucket.upload(filePath, {
            destination: newFilename,
        });
        console.log(`${newFilename} uploaded to ${bucketName}.`);
        fs.unlinkSync(filePath);
        return bucket.file(newFilename);
    }
    console.log('Uploading file');
    const fileContent = fs.readFileSync(filePath);
    console.log('File uploaded');
    let jobSeeker
    try {
        jobSeeker = await Jobseeker.findOne({ user: userId }).populate('user');
    } catch (err) {
        console.log('Error finding jobSeeker:', err);
    }
    console.log('JobSeeker:', jobSeeker);
    try {
        const file = await uploadFile(storage, bucketName, filePath, newFilename);
        const processedDocument = await processDocument(bucketName, newFilename, fileContent);
        const tokens = await analyzeText(processedDocument);
        console.log('JobSeeker:', jobSeeker);
        jobSeeker.resumeTokens = [];  // Here we reset resumeTokens
        jobSeeker.resumeTokens = jobSeeker.resumeTokens.concat(tokens);
        await file.delete();
    } catch (error) {
        console.log('Error processing document:', error);
        if (error.statusDetails && error.statusDetails[0] && error.statusDetails[0].fieldViolations) {
            console.log('Field Violations:', error.statusDetails[0].fieldViolations);
        }
    }
    console.log('Saving jobSeeker');
    await jobSeeker.save();
    console.log('Resume processed');
});

module.exports = resumeProcessingQueue;