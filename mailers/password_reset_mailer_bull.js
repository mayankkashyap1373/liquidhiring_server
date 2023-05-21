const nodeMailer = require('../config/nodemailer');
const path = require('path');
const ejs = require('ejs');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');

// Send password reset email
exports.sendPasswordResetEmail = (user) => {
    try {
        // Render password reset email template
        const htmlString = nodeMailer.renderTemplate({ user: user }, '/password_reset/send_password_reset.ejs');

        // Send the email
        nodeMailer.transporter.sendMail(
            {
                from: 'noreply@liquidhiring.com',
                to: user.email,
                subject: 'Password Reset',
                html: htmlString,
            },
            (err, info) => {
                if (err) {
                    throw new ErrorHandler(500, 'Error in sending mail', err);
                }
            }
        );
    } catch (error) {
        handleError(error);
    }
};