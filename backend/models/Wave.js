const mongoose = require('mongoose');

const waveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: String, // Cloudinary URL
    type: { type: String, enum: ['photo', 'video', 'text'], required: true },
    caption: String,
    textContent: String,
    backgroundColor: String, // for text waves
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New field
    viewCount: { type: Number, default: 0 },
    expiresAt: Date, // 24 hours from creation
    createdAt: { type: Date, default: Date.now }
});

waveSchema.index({ expiresAt: 1 }); // for cron job to delete
waveSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Wave', waveSchema);