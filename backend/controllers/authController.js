const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register user (4-step complete registration)
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, teachTags, learnTags, location, availability, bio } = req.body;

    // Validation
    if (!email || !password || password !== confirmPassword) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    if (!teachTags || teachTags.length === 0 || !learnTags || learnTags.length === 0) {
      return res.status(400).json({ error: 'Must select at least 1 skill to teach and learn' });
    }

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Location required' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      teachTags,
      learnTags,
      location,
      availability,
      bio
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        location: user.location,
        teachTags: user.teachTags,
        learnTags: user.learnTags
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('allies', 'name profilePhoto');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout (frontend clears token, backend can blacklist if needed)
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};

// Refresh token
exports.refreshToken = (req, res) => {
  try {
    const token = generateToken(req.user.userId);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;