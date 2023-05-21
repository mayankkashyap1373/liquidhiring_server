const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);