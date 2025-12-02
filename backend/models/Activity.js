const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Running', 'Yoga', 'Music', 'Cooking', 'Tech', 'Art', 'Other'],
    default: 'Other'
  },
  time: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number], // [lat, lng]
    required: true,
    index: '2dsphere' // For geospatial queries if needed later
  },
  description: {
    type: String,
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date
  },
  meetingLink: {
    type: String,
    trim: true
  },
  recordingLink: {
    type: String,
    trim: true
  }
});

// Create TTL index - MongoDB will automatically delete documents when expireAt date is reached
// The background task runs every 60 seconds, so deletion may take up to 1 minute after expireAt
activitySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Activity', activitySchema);
