// Path: controllers/api/v1/userController.js

const User = require('../../../models/user');
const Jobseeker = require('../../../models/jobSeeker');
const Employer = require('../../../models/employer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Queue = require('bull');
const emailVerificationQueue = new Queue('emailVerification');
const passwordResetQueue = new Queue('passwordReset');
// const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');
const path = require('path');
const fs = require('fs');
const RESUME_PATH = 'uploads/jobseekers/resume';
const resumeProcessingQueue = require('../../../queueProcessors/resumeProcessor');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, firstName, lastName, companyName } = req.body;

        if (!password) {
            console.log('Password is required');
            // throw new ErrorHandler(400, 'Password is required');
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Username or email already exists');
            // throw new ErrorHandler(409, 'Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(8));

        const newUser = new User({ username, email, password: hashedPassword, role });
        await newUser.save();

        const profile = role === 'jobseeker'
            ? new Jobseeker({ user: newUser._id, firstName, lastName })
            : new Employer({ user: newUser._id, companyName });
        await profile.save();

        newUser.profile = profile;
        newUser.profileType = role === 'jobseeker' ? 'Jobseeker' : 'Employer';
        await newUser.save();
        const token = crypto.randomBytes(32).toString('hex');
        newUser.emailVerificationToken = token;
        newUser.emailVerificationTokenExpiresAt = Date.now() + 3600000;
        await newUser.save();
        const job = await emailVerificationQueue.add(newUser);
        res.status(201).json({ status: 'success', message: 'Verification email sent' });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.currentUser = (req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
};

exports.updateUser = async (req, res) => {
    try {
        const allowedUserUpdates = ['username', 'email'];
        const allowedJobseekerUpdates = ['firstName', 'lastName', 'resume', 'phone', 'address', 'jobTypePreference', 'salaryExpectations', 'preferredJobLocation'];
        const allowedEmployerUpdates = ['companyName'];
        const updates = Object.keys(req.body).filter((key) => allowedUserUpdates.includes(key));
        updates.forEach((update) => {
            if (req.body[update] !== '') {
                req.user[update] = req.body[update];
            }
        });
        let jobSeeker, employer;
        if (req.user.role === 'jobseeker') {
            jobSeeker = await Jobseeker.findOne({ user: req.user._id }).populate('user');
            if (jobSeeker) {
                const jobseekerUpdates = Object.keys(req.body).filter((key) => allowedJobseekerUpdates.includes(key));

                jobseekerUpdates.forEach((update) => {
                    if (req.body[update] !== '') {
                        jobSeeker[update] = req.body[update];
                    }
                });
                await jobSeeker.save();
            }
        } else if (req.user.role === 'employer') {
            employer = await Employer.findOne({ user: req.user._id }).populate('user');
            if (employer) {
                const employerUpdates = Object.keys(req.body).filter((key) => allowedEmployerUpdates.includes(key));
                employerUpdates.forEach((update) => {
                    if (req.body[update] !== '') {
                        employer[update] = req.body[update];
                    }
                });
                await employer.save();
            }
        }
        await req.user.save();
        let responseData;
        if (jobSeeker) {
            responseData = {
                user: {
                    ...jobSeeker.user.toObject(),
                    firstName: jobSeeker.firstName,
                    lastName: jobSeeker.lastName,
                    phone: jobSeeker.phone,
                    address: jobSeeker.address,
                    jobTypePreference: jobSeeker.jobTypePreference,
                    salaryExpectations: jobSeeker.salaryExpectations,
                    preferredJobLocation: jobSeeker.preferredJobLocation,

                },
            };
        } else if (employer) {
            responseData = {
                user: {
                    ...employer.user.toObject(),
                    companyName: employer.companyName,
                },
            };
        } else {
            responseData = { user: req.user.toObject() };
        }
        delete responseData.user.password;
        delete responseData.user.__v

        res.status(200).json({ status: 'success', data: responseData });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file provided');
            // throw new ErrorHandler(400, 'No file provided');
        }
        
        // You can adjust the logic below to fit your data model
        if (req.user.role === 'jobseeker') {
            const jobSeeker = await Jobseeker.findOne({ user: req.user._id });
            if (!jobSeeker) {
                throw new ErrorHandler(404, 'Jobseeker profile not found');
            }
            jobSeeker.profilePicture = Jobseeker.profilePicturePath + '/' + req.file.filename;
            await jobSeeker.save();
            res.status(200).json({ status: 'success', data: { imageUrl: jobSeeker.profilePicture } });
        } else if (req.user.role === 'employer') {
            const employer = await Employer.findOne({ user: req.user._id });
            if (!employer) {
                throw new ErrorHandler(404, 'Employer profile not found');
            }
            employer.profilePicture = Employer.profilePicturePath + '/' + req.file.filename;
            await employer.save();
            res.status(200).json({ status: 'success', data: { imageUrl: employer.profilePicture } });
        } else {
            console.log('Unknown user role');
            // throw new ErrorHandler(400, 'Unknown user role');
        }
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            console.log('Verification token is required');
            // throw new ErrorHandler(400, 'Verification token is required');
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            console.log('Invalid or expired verification token');
            // throw new ErrorHandler(400, 'Invalid or expired verification token');
        }

        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiresAt = undefined;
        user.isEmailVerified = true;
        await user.save();

        res.status(200).json({ status: 'success', data: { user }, message: 'Email successfully verified' });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            console.log('Email is required');
            // throw new ErrorHandler(400, 'Email is required');
        }
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            // throw new ErrorHandler(404, 'User not found');
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpiresAt = Date.now() + 3600000;
        await user.save();
        const job = await passwordResetQueue.add(user);

        res.status(200).json({ status: 'success', message: 'Password reset email queued for sending' });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            console.log('Reset token is required');
            // throw new ErrorHandler(400, 'Reset token is required');
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            console.log('Invalid or expired reset token');
            // throw new ErrorHandler(400, 'Invalid or expired reset token');
        }

        res.status(200).json({ status: 'success', message: 'Valid reset token' });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            console.log('Reset token and new password are required');
            // throw new ErrorHandler(400, 'Reset token and new password are required');
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            console.log('Invalid or expired reset token');
            // throw new ErrorHandler(400, 'Invalid or expired reset token');
        }
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        await user.save();
        res.status(200).json({ status: 'success', message: 'Password successfully reset' });
    } catch (error) {
        console.log(error);
        // handleError(error, res);
    }
};