const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: String,
    coverPhoto: String,
    bio: { type: String, maxlength: 500 },

    // Location (simple, no GeoJSON)
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        areaLabel: { type: String, required: true }, // "Koramangala, Bangalore"
    },

    // Skills
    teachTags: [
        {
            name: String,
            slug: String,
        },
    ],
    learnTags: [
        {
            name: String,
            slug: String,
        },
    ],

    availability: {
        type: String,
        enum: ['morning', 'evening', 'weekends', 'flexible'],
        default: 'flexible',
    },

    stats: {
        sessionsCompleted: { type: Number, default: 0 },
        hoursCompleted: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
    },

    isVerified: { type: Boolean, default: false },
    verificationCode: String,

    allies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Incoming
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// compare password
userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

// REMOVE the geo index — your data is not GeoJSON.
/*
userSchema.index({ location: '2dsphere' });
*/

module.exports = mongoose.model('User', userSchema);
