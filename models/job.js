const mongoose = require('mongoose');

const JobType = {
    FullTime: 'Full Time',
    PartTime: 'Part Time',
    Internship: 'Internship',
    Freelance: 'Freelance',
};

const WorkLocation = {
    Onsite: 'Onsite',
    Remote: 'Remote',
    Hybrid: 'Hybrid',
};

const Education = {
    HighSchool: 'High School',
    Bachelors: 'Bachelors',
    Masters: 'Masters',
    Phd: 'Phd',
};

const JobCategory = {
    WebDevelopment: 'Web Development',
    MobileDevelopment: 'Mobile Development',
    UIUXDesign: 'UI/UX Design',
    GraphicsDesign: 'Graphics Design',
    ContentWriting: 'Content Writing',
    Marketing: 'Marketing',
    Accounting: 'Accounting',
    CustomerSupport: 'Customer Support',
    Legal: 'Legal',
    Other: 'Other',
};

const Experience = {
    NO_EXPERIENCE: 'No Experience',
    ONE_YEAR: '1 Year',
    TWO_YEARS: '2 Years',
    THREE_YEARS_PLUS: '3 Years and above',
};

// Job schema definition
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    jobType: {
        type: String,
        enum: Object.values(JobType),
        default: JobType.FullTime,
    },
    workLocation: {
        type: String,
        enum: Object.values(WorkLocation),
        default: WorkLocation.Onsite,
    },
    education: {
        type: String,
        enum: Object.values(Education),
        default: Education.Bachelors,
    },
    jobCategory: {
        type: String,
        enum: Object.values(JobCategory),
        default: JobCategory.WebDevelopment,
    },
    experience: {
        type: String,
        enum: Object.values(Experience),
        default: Experience.NO_EXPERIENCE,
    },
    salary: {
        type: Number,
        min: 1,
        max: 1000000,
        default: 1,
    },
    positions: {
        type: Number,
        default: 1,
    },
    applicationDeadline: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer', // reference the Employer model
        required: true,
    },    
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Export the Job model
module.exports = mongoose.model('Job', jobSchema);