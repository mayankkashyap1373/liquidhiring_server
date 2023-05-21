const { profile } = require('console');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const profilePicturePath = path.join('/uploads/jobseekers/avatars');
const RESUME_PATH = path.join('/uploads/jobseekers/resumes');

const jobSeekerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    avatar: {
        type: String,
    },
    resumeTokens: {
        type: Array,
        default: []
    },
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    jobTypePreference: {
        type: String,
        default: '',
    },
    salaryExpectations: {
        type: Number,
        default: null,
    },
    preferredJobLocation: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Define storage configuration for the resume
let resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Destination function called');
        cb(null, path.join(__dirname, '..', RESUME_PATH));
    },
    filename: (req, file, cb) => {
        console.log('Filename function called');
        const fileExt = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + fileExt);
    }
});

// Define storage configuration for the avatar
let profilePictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Destination function called');
        cb(null, path.join(__dirname, '..', profilePicturePath));
    },
    filename: (req, file, cb) => {
        console.log('Filename function called');
        const fileExt = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + fileExt);
    }
});

// Static method for uploading resume
jobSeekerSchema.statics.uploadResumeMiddleware = multer({ storage: resumeStorage }).single('resume');
jobSeekerSchema.statics.resumePath = RESUME_PATH;
jobSeekerSchema.statics.profilePicturePath = profilePicturePath;
jobSeekerSchema.statics.uploadProfilePictureMiddleware = multer({ storage: profilePictureStorage }).single('avatar');

// Export the JobSeeker model
module.exports = mongoose.model('JobSeeker', jobSeekerSchema);