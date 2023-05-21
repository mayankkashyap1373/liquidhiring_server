const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const { handleError, ErrorHandler } = require('../../../helpers/errorHandler');

exports.isUser = async (req, res, next) => {
    console.log(req.headers.authorization);
    try {
        // Check if the Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ErrorHandler(401, 'You are not logged in. Please log in to get access.');
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];

        console.log(token);

        // Verify the token
        const decoded = jwt.verify(token, 'process.env.JWT_SECRET');
        console.log(decoded);

        // Find the user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw new ErrorHandler(401, 'The user belonging to this token no longer exists.');
        }

        // Attach the user to the request object
        req.user = currentUser;
        next();
    } catch (error) {
        console.log(error);
        handleError(error, res);
    }
};

exports.isEmployer = async (req, res, next) => {
    try {
        // Check if the Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ErrorHandler(res, 401, 'You are not logged in. Please log in to get access.');
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, 'process.env.JWT_SECRET');

        // Find the user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw new ErrorHandler(res, 401, 'The user belonging to this token no longer exists.');
        }

        // Check if the user role is 'employer'
        if (currentUser.role !== 'employer') {
            throw new ErrorHandler(res, 403, 'Forbidden: Access is allowed only to employers.');
        }

        // Attach the user to the request object
        req.user = currentUser;
        next();
    } catch (error) {
        handleError(error, res);
    }
};

exports.isJobseeker = async (req, res, next) => {
    try {
        // Check if the Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ErrorHandler(res, 401, 'You are not logged in. Please log in to get access.');
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, 'process.env.JWT_SECRET');

        // Find the user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw new ErrorHandler(res, 401, 'The user belonging to this token no longer exists.');
        }

        // Check if the user role is 'jobseeker'
        if (currentUser.role !== 'jobseeker') {
            throw new ErrorHandler(res, 403, 'Forbidden: Access is allowed only to jobseekers.');
        }

        // Attach the user to the request object
        req.user = currentUser;
        next();
    } catch (error) {
        handleError(error, res);
    }
};