// models/AppliedJob.js
const mongoose = require('mongoose');

// AppliedJob schema definition
const appliedJobSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    jobseeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobseeker',
        required: true,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

// Export the AppliedJob model
module.exports = mongoose.model('AppliedJob', appliedJobSchema);