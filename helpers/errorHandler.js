class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        // Set the status code and message for the error
        this.statusCode = statusCode || 500;
        this.message = message;
    }
}

const handleError = (err, res) => {
    if (!err) {
        console.error('An unknown error occurred');
        res.status(500).json({ status: 'error', message: 'An unknown error occurred' });
        return;
    }

    // Check if the statusCode is defined and has a valid value, otherwise, set a default value
    const statusCode = err.statusCode && !isNaN(err.statusCode) ? err.statusCode : 500;
    const message = err.message;

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

module.exports = {
    ErrorHandler,
    handleError,
};