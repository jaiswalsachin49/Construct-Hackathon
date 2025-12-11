const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  // Core Info
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Running', 'Yoga', 'Music', 'Cooking', 'Tech', 'Art', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },

  // Location
  coordinates: {
    type: [Number], // [lat, lng]
    required: true,
    index: '2dsphere'
  },
  location: {
    type: String,
    required: true
  },

  // Stream Lifecycle
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled',
    index: true
  },
  startedAt: {
    type: Date,
    index: true
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Minutes
    default: 0
  },

  // Agora Integration
  agoraChannelId: {
    type: String,
    required: true,
    unique: true
  },
  agoraRecordingId: {
    type: String
  },
  recordingUrl: {
    type: String
  },
  thumbnail: {
    type: String
  },

  // Analytics
  viewerCount: {
    type: Number,
    default: 0
  },
  peakViewers: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient live stream queries
liveStreamSchema.index({ status: 1, startedAt: -1 });

// Index for user's past streams
liveStreamSchema.index({ host: 1, createdAt: -1 });

// Update timestamp on save
liveStreamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
