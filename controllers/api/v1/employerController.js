const Job = require('../../../models/job');
const AppliedJob = require('../../../models/appliedJob');
const Employer = require('../../../models/employer');
const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');

// Create a new job
exports.createJob = async (req, res) => {
    try {
        // Find the employer associated with the current user
        const employer = await Employer.findOne({ user: req.user._id });

        // Check if title is included in the request body
        if (!req.body.title) {
            return res.status(400).json({ status: 'error', message: 'Title is required' });
        }

        // Add the employer's _id to the job data
        const jobData = { ...req.body, employer: employer._id };
        const job = await Job.create(jobData);
        res.status(201).json({ status: 'success', data: { job } });
    } catch (error) {
        console.log("Reaching here", error);
    }
};

// Update a job
exports.updateJob = async (req, res) => {
    try {
        const employer = await Employer.findOne({ user: req.user._id });

        const job = await Job.findOneAndUpdate({ _id: req.params.id, employer: employer.id }, req.body, {
            new: true,
            runValidators: true,
        });

        if (!job) {
            throw new ErrorHandler(404, 'Job not found');
        }

        res.status(200).json({ status: 'success', data: { job } });
    } catch (error) {
        handleError(res, error);
    }
};

// Delete a job
exports.deleteJob = async (req, res) => {
    try {
        const employer = await Employer.findOne({ user: req.user._id });
        const job = await Job.findOneAndDelete({ _id: req.params.id, employer: employer.id });
        if (!job) {
            throw new ErrorHandler(404, 'Job not found');
        }

        res.status(204).json({ status: 'success', message: 'Job deleted successfully', data: null });
    } catch (error) {
        handleError(res, error);
    }
};

// Get jobs posted by the employer
exports.getEmployerJobs = async (req, res) => {
    try {
        const employer = await Employer.findOne({ user: req.query.userId });
        const jobs = await Job.find({ employer: employer.id });
        res.status(200).json({ status: 'success', results: jobs.length, data: { jobs } });
    } catch (error) {
        handleError(res, new ErrorHandler(500, 'Error fetching employer jobs', error));
    }
};

// Get candidates who applied for a specific job
exports.getJobCandidates = async (req, res) => {
    try {
        const employer = await Employer.findOne({ user: req.user._id });
        const job = await Job.findOne({ _id: req.params.id, employer: employer.id });
        if (!job) {
            throw new ErrorHandler(404, 'Job not found');
        }

        const appliedJobs = await AppliedJob.find({ job: req.params.id }).populate({
            path: 'jobseeker',
            model: 'JobSeeker',
            populate: { path: 'user' },
        });

        const candidates = appliedJobs.map((appliedJob) => {
            const { jobseeker } = appliedJob;
            const { user } = jobseeker;

            return {
                ...jobseeker._doc,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            };
        });

        res.status(200).json({ status: 'success', results: candidates.length, data: { candidates } });
    } catch (error) {
        handleError(res, error);
    }
};