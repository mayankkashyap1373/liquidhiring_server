const User = require('../../../models/user');
const jwt = require('jsonwebtoken');
// const { ErrorHandler, handleError } = require('../../../helpers/errorHandler');
require('dotenv').config();
const crypto = require('crypto');
const Queue = require('bull');
const JobSeeker = require('../../../models/jobSeeker');
const Employer = require('../../../models/employer');
const emailVerificationQueue = new Queue('emailVerification');

// User login
exports.login = async (req, res) => {
    console.log('Request:', req.body);
    try {
        const { identifier, password } = req.body; // Rename email to identifier
        if (!identifier || !password) {
            console.log('Please provide email/username and password');
            // throw new ErrorHandler(400, 'Please provide email/username and password');
        }

        // Check for the user using either email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier },
            ],
        }).select('+password');


        if (!user || !(await user.correctPassword(password, user.password))) {
            console.log('Incorrect email/username or password');
            // throw new ErrorHandler(401, 'Incorrect email/username or password');
        }


        let jobSeeker, employer;

        if (user.role === 'jobseeker') {
            jobSeeker = await JobSeeker.findOne({ user: user._id });
        } else if (user.role === 'employer') {
            employer = await Employer.findOne({ user: user._id });
        }
        console.log('Reached checkpoint 4');
        // If the user has not verified their email, send a verification email
        if (!user.isEmailVerified) {
            console.log("Reached checkpoint 5");
            const token = crypto.randomBytes(32).toString('hex');
            user.emailVerificationToken = token;
            user.emailVerificationTokenExpiresAt = Date.now() + 3600000; // 1 hour
            await user.save();

            // Add a job to the Bull queue
            const job = await emailVerificationQueue.add(user);

            return res.status(200).json({
                status: 'success',
                message: 'Please verify your email',
            });
        }

        console.log('Reached checkpoint 5');

        // Hardcode the expiration value to 1 day
        const expiresIn = '1d';

        const token = jwt.sign({ id: user._id }, 'process.env.JWT_SECRET', {
            expiresIn: expiresIn,
        });

        let responseData;
        if (jobSeeker) {
            responseData = {
                user: {
                    ...user.toObject(),
                    firstName: jobSeeker.firstName,
                    lastName: jobSeeker.lastName,
                    resume: jobSeeker.resume,
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
                    ...user.toObject(),
                    companyName: employer.companyName,
                },
            };
        } else {
            responseData = { user: user.toObject() };
        }

        // Remove sensitive fields from responseData.user
        delete responseData.user.password;
        delete responseData.user.__v;

        res.status(200).json({ status: 'success', token, data: responseData });
    } catch (error) {
        console.log('Error: ', error);
        // handleError(error, res);
    };
};

// User logout
exports.logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ status: 'success' });
};