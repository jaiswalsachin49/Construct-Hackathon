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
    type: String, // Can be a specific date string or "Today, 8:00 PM"
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
    default: Date.now,
    expires: 86400 // Auto-expire after 24 hours (optional, based on requirement "pin auto-expires")
  }
});

module.exports = mongoose.model('Activity', activitySchema);
