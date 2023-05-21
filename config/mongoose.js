const mongoose = require('mongoose');
const env = require('./environment');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');

// Connect to MongoDB using Mongoose and the connection string
mongoose.connect(env.mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection object
const db = mongoose.connection;

// Log an error message if there's an issue connecting to the database
db.on('error', (err) => {
    handleError(new ErrorHandler(500, "Error connecting to the database.", err));
});

// Log a success message once connected to the database
db.once('open', () => {
    console.log("Connected to the database :: MongoDB");
});

// Export the connection object
module.exports = db;