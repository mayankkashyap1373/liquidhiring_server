const nodeMailer = require('../config/nodemailer');
const path = require('path');
const ejs = require('ejs');
// const { ErrorHandler, handleError } = require('../helpers/errorHandler');

// Send email verification email
exports.sendVerificationEmail = (user) => {
    try {
        // Render email verification email template
        const htmlString = nodeMailer.renderTemplate({ user: user }, '/email_verification/send_verification.ejs');

        // Send the email
        nodeMailer.transporter.sendMail(
            {
                from: 'noreply@liquidhiring.com',
                to: user.email,
                subject: 'Email Verification',
                html: htmlString,
            },
            (err, info) => {
                if (err) {
                    console.log('Error in sending mail', err);
                    // throw new ErrorHandler(500, 'Error in sending mail', err);
                }
            }
        );
    } catch (error) {
        console.log('Error in sending mail', error);
        // handleError(error);
    }
};
