require('dotenv').config();
const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');

const logDirectory = path.join(__dirname, '../production_logs');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory,
});

const development = {
    name: 'development',
    asset_path: './assets',
    session_cookie_key: 'blahsomething',
    mongo_uri: 'mongodb://localhost/liquidhiring_server_development',
    smtp: {
        host: 'premium102.web-hosting.com',
        port: 465,
        secure: true,
        auth: {
            user: 'noreply@liquidhiring.com',
            pass: 'Li06Qu10Id22@'
        }
    },
    google_oauth_client_id: "513575681833-35vvjrp3l7n0g2q3597r4ri3m9m30kvk.apps.googleusercontent.com",
    google_oauth_client_secret: "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",
    google_oauth_callback_url: "http://localhost:8000/users/auth/google/callback",
    jwt_secret: 'chattersphere',
    morgan: {
        mode: 'dev',
        options: { stream: accessLogStream }
    }
}

const production = {
    name: 'production',
    asset_path: process.env.ASSET_PATH,
    session_cookie_key: process.env.SESSION_COOKIE_KEY,
    mongo_uri: process.env.MONGO_URI,
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    google_oauth_client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    google_oauth_client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    google_oauth_callback_url: process.env.GOOGLE_OAUTH_CALLBACK_URL,
    jwt_secret: process.env.JWT_SECRET,
    morgan: {
        mode: 'combined',
        options: { stream: accessLogStream }
    }
};

module.exports = eval(process.env.NODE_ENV) == undefined ? development : eval(process.env.NODE_ENV);