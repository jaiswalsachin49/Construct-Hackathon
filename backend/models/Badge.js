const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    icon: String, // emoji or icon name
    trigger: {
        type: String,
        enum: ['first_session', 'trusted', 'helper', 'learner', 'community_builder', 'speedster']
    },
    createdAt: { type: Date, default: Date.now }
});

badgeSchema.index({ name: 1 });
badgeSchema.index({ trigger: 1 });

module.exports = mongoose.model('Badge', badgeSchema);