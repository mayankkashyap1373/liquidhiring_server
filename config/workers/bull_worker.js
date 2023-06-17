const Queue = require('bull');
const emailVerificationMailer = require('../../mailers/email_verification_mailer_bull');
const passwordResetMailer = require('../../mailers/password_reset_mailer_bull');
// const { ErrorHandler, handleError } = require('../../helpers/errorHandler');

const emailVerificationQueue = new Queue('emailVerification');
const passwordResetQueue = new Queue('passwordReset');

// Process the emailVerification job
emailVerificationQueue.process(async (job) => {
    try {
        emailVerificationMailer.sendVerificationEmail(job.data);
    } catch (err) {
        console.log('Error processing emailVerification job', err);
        // handleError(new ErrorHandler(500, 'Error processing emailVerification job', err));
    }
});

// Process the passwordReset job
passwordResetQueue.process(async (job) => {
    try {
        passwordResetMailer.sendPasswordResetEmail(job.data);
    } catch (err) {
        console.log('Error processing passwordReset job', err);
        // handleError(new ErrorHandler(500, 'Error processing passwordReset job', err));
    }
});