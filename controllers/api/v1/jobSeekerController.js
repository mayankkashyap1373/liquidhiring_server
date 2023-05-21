// Path: controllers/api/v1/jobSeekerController.js

const Job = require('../../../models/job');
const AppliedJob = require('../../../models/appliedJob');
const JobSeeker = require('../../../models/jobSeeker');
const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');
const path = require('path');
const fs = require('fs');
const RESUME_PATH = 'uploads/jobseekers/resume';
const resumeProcessingQueue = require('../../../queueProcessors/resumeProcessor');
const User = require('../../../models/user');
const Jobseeker = require('../../../models/jobSeeker');

exports.uploadAvatar = async (req, res) => {
    console.log('Request body', req.body);
    try {
    } catch (error) {
        handleError(error, res);
    }
};

exports.uploadResume = async (req, res) => {
    console.log('Request body', req.body);
    try {
        const user = await User.findOne({ email: req.body.email });
        const jobSeeker = await Jobseeker.findOne({ user: user._id }).populate('user');
        if (req.body.resume) {
            const base64Data = req.body.resume.replace(/^data:.*;base64,/, '');
            const resumeDataUrl = req.body.resume;
            const fileExtMatch = resumeDataUrl.match(/^data:.*\/(.*);base64,/);
            if (!fileExtMatch || fileExtMatch.length < 2) {
                throw new ErrorHandler(400, 'Invalid resume data format');
            }
            const fileExt = '.' + fileExtMatch[1];
            const newFilename = 'resume-' + Date.now() + fileExt;
            const filePath = path.join(__dirname, '../../..', RESUME_PATH, newFilename);

            const uploadPath = path.join(__dirname, '../../..', RESUME_PATH);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            fs.writeFileSync(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                }
            });
            jobSeeker.resume = newFilename;
            console.log('Starting resume processing');
            await resumeProcessingQueue.add({
                userId: req.user._id,
                resumeDataUrl: req.body.resume,
                filePath,
                newFilename
            });
            resumeProcessingQueue.on('failed', (job, err) => {
                console.log(`Job failed with error ${err.message}`);
            });
        }
        await jobSeeker.save();
        res.status(200).json({ status: 'success', message: 'Resume uploaded and processing started.' });
    } catch (error) {
        console.log(error);
        handleError(error, res);
    }
};

// Apply to a job
exports.applyJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            throw new ErrorHandler(404, 'Job not found');
        }

        const jobseeker = await JobSeeker.findOne({ user: req.user._id });

        const appliedJob = await AppliedJob.create({
            job: req.params.id,
            jobseeker: jobseeker._id,
        });

        res.status(201).json({ status: 'success', data: { appliedJob } });
    } catch (error) {
        handleError(error, res);
    }
};

// Get jobs applied by the jobseeker
exports.getAppliedJobs = async (req, res) => {
    try {
        const jobseeker = await JobSeeker.findOne({ user: req.user._id });
        const appliedJobs = await AppliedJob.find({ jobseeker: jobseeker._id }).populate('job');
        const jobs = appliedJobs.map((appliedJob) => appliedJob.job);

        res.status(200).json({ status: 'success', results: jobs.length, data: { jobs } });
    } catch (error) {
        handleError(error, res);
    }
};

// Check if jobseeker has applied for a job
exports.checkAppliedJob = async (req, res) => {
    try {
        const jobseeker = await JobSeeker.findOne({ user: req.user._id });
        const appliedJob = await AppliedJob.findOne({ job: req.params.id, jobseeker: jobseeker._id });

        if (!appliedJob) {
            throw new ErrorHandler(404, 'Job not found');
        }

        res.status(200).json({ status: 'success', isApplied: true, message: 'Job applied' });
    } catch (error) {
        handleError(error, res);
    }
};