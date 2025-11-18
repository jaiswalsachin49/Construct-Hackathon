const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: String,
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ['proposed', 'confirmed', 'completed', 'cancelled'], default: 'proposed' },
    duration: Number, // in minutes
    location: String, // online or specific location
    notes: String,
    rating: Number,
    review: String,
    createdAt: { type: Date, default: Date.now }
});

sessionSchema.index({ teacherId: 1, startTime: 1 });
sessionSchema.index({ learnerId: 1, startTime: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);