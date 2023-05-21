const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const profilePicturePath = path.join('/uploads/emloyers/logos');

// Employer schema definition
const employerSchema = new mongoose.Schema({
    companyLogo: {
        type: String,
    },
    companyName: {
        type: String,
        required: true,
    },
    companyDescription: {
        type: String,
    },
    industry: {
        type: String,
    },
    companySize: {
        type: Number,
    },
    companyCulture: {
        type: String,
    },
    benefits: {
        type: String,
    },
    locations: [{
        type: String,
    }],
    careerDevelopmentOpportunities: {
        type: String,
    },
    reviews: [{
        type: String,
    }],
    ratings: [{
        type: Number,
    }],
    companyPolicies: {
        type: String,
    },
    csrActivities: {
        type: String,
    },
    preferredCandidateProfile: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

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

employerSchema.statics.profilePictureMiddleware = multer({ storage: profilePictureStorage }).single('companyLogo');
employerSchema.statics.profilePicturePath = profilePicturePath;

// Export the Employer model
module.exports = mongoose.model('Employer', employerSchema);