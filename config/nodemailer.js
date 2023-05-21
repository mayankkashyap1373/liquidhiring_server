const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const env = require('./environment');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');

let transporter = nodemailer.createTransport({
    host: 'premium102.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
        user: 'noreply@liquidhiring.com',
        pass: 'Li06Qu10Id22@',
    },
});

let renderTemplate = (data, relativePath) => {
    try {
        let mailHTML;
        ejs.renderFile(
            path.join(__dirname, '../views/mailers', relativePath),
            data,
            (err, template) => {
                if (err) {
                    throw new ErrorHandler(500, 'Error in rendering template', err);
                }
                mailHTML = template;
            }
        );
        return mailHTML;
    } catch (err) {
        handleError(err);
    }
};

module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate,
};