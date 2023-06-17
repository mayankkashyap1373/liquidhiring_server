const Job = require('../../../models/job');
const AppliedJob = require('../../../models/appliedJob');
// const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalJobs = await Job.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    const jobs = await Job.find()
      .skip(skip)
      .limit(limit)
      .populate('employer')
      .catch(err => console.log(err)); // Log any errors

    console.log(jobs);

    const jobsWithCandidates = await Promise.all(
      jobs.map(async (job) => {
        const appliedJobs = await AppliedJob.find({ job: job._id });
        const candidates = appliedJobs ? appliedJobs.length : 0;
        return { ...job._doc, candidates };
      })
    );

    res.status(200).json({ jobs: jobsWithCandidates, total_pages: totalPages });
  } catch (error) {
    console.log(error);
    // handleError(error, res);
  }
};

// Get a specific job by ID
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new ErrorHandler(404, 'Job not found');

    const appliedJobs = await AppliedJob.find({ job: job._id });
    res.status(200).json({ job, candidates: appliedJobs ? appliedJobs.length : 0 });
  } catch (error) {
    console.log(error);
    // handleError(error, res);
  }
};

// Search for jobs based on various criteria
exports.searchJobs = async (req, res) => {
  try {
    // Extract search criteria from the request body
    const { title, jobType, education, industry, experience } = req.body;

    // Build the search query object
    const searchQuery = {};
    if (title) searchQuery.title = { $regex: new RegExp(title, 'i') };
    if (jobType) searchQuery.jobType = jobType;
    if (education) searchQuery.education = education;
    if (industry) searchQuery.industry = industry;
    if (experience) searchQuery.experience = experience;

    // Find matching jobs
    const jobs = await Job.find(searchQuery);

    // Get the number of candidates for each job
    const jobsWithCandidates = await Promise.all(jobs.map(async (job) => {
      const appliedJobs = await AppliedJob.find({ job: job._id });
      const candidates = appliedJobs ? appliedJobs.length : 0;
      return { ...job._doc, candidates };
    }));

    // Return the matching jobs with the number of candidates
    res.status(200).json(jobsWithCandidates);
  } catch (error) {
    console.log(error);
    // handleError(error, res);
  }
};

// Get top 6 salaried jobs
exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ salary: -1 }).limit(6);
    console.log(jobs);
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    // handleError(error, res);
  }
};