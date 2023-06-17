// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const env = require('./config/environment');
const logger = require('morgan');
const cors = require('cors');
// const { handleError } = require('./helpers/errorHandler');
const chatGPTProcessor = require('./queueProcessors/chatGPTProcessor');

// Create an Express application
const app = express();

console.log('Starting Part 1 running...');

// Create an HTTP server from the Express application
const server = http.createServer(app);

// Create a new Socket.IO instance and attach it to the server
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8000'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('suggestResume', async (data) => {
        const { email } = data;

        // Add job to the queue
        const job = await chatGPTProcessor.add({ email });

        // Listen for the 'progress' event on the queue and emit the progress to the client
        chatGPTProcessor.on('global:progress', (jobId, progress) => {
            if (jobId === job.id) {
                console.log('Job progress:', progress);
                socket.emit('progress', progress);
            }
        });        

        // Wait for the job to complete or fail, then emit the result or error
        chatGPTProcessor.on('global:completed', async (jobId, result) => {
            if (jobId === job.id) {
                console.log('Job completed, sending suggestions');
                console.log('Suggestions Index: ', result);
                socket.emit('suggestions', { text: result });
            }
        });

        chatGPTProcessor.on('global:failed', async (jobId, err) => {
            if (jobId === job.id) {
                console.log('Job failed, sending error');
                socket.emit('error', 'Failed to generate suggestions');
            }
        });

    });

    socket.on('connect_error', (err) => {
        console.log('Error connecting to server:', err);
    });
});
console.log('Starting Part 2 running...');

// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8000'],
}));

// Import the dotenv module for loading environment variables from a .env file
require('dotenv').config();

// Get the port number from the environment variables
const port = process.env.PORT || 8080;

// Import database configuration
const db = require('./config/mongoose');

// Middleware for parsing request bodies (form data)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Use the morgan module for logging HTTP requests
app.use(logger(env.morgan.mode, env.morgan.options));

// Use the main router for handling all routes
app.use('/', require('./routes'));

// Error handling middleware
// app.use((err, req, res, next) => {
//     handleError(err, res);
// });

console.log('Starting Part 3 running...');

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start the server on the specified port
server.listen(port, (err) => {
    if (err) {
        console.log(`Error in running the server: ${err}`);
    }
    console.log(`Server is running on http://localhost:${port}`);
});