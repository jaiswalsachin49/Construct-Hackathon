const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    // Basic info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    profilePhoto: String, // Cloudinary URL
    coverPhoto: String, // Cloudinary URL
    bio: { type: String, maxlength: 500 },

    // Location
    location: {
        lat: Number,
        lng: Number,
        areaLabel: String // "Koramangala, Bangalore"
    },

    // Skills
    teachTags: [{ tag: String, level: String }], // level: beginner/intermediate/expert
    learnTags: [String],

    // Availability
    availability: String, // morning/evening/weekend/flexible

    // Stats
    stats: {
        sessionsCompleted: { type: Number, default: 0 },
        hoursCompleted: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationCode: String,

    // Connections
    allies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Badges
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (inputPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(inputPassword, this.password);
};

// Create geospatial index
userSchema.index({ 'location': '2dsphere' });
userSchema.index({ 'email': 1 });
userSchema.index({ 'teachTags.tag': 'text', 'name': 'text' });

module.exports = mongoose.model('User', userSchema);