const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, enum: ['user', 'post', 'comment'] },
    targetId: mongoose.Schema.Types.ObjectId,
    reason: String,
    details: String,
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    resolution: String,
    createdAt: { type: Date, default: Date.now }
});

reportSchema.index({ reporterId: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);