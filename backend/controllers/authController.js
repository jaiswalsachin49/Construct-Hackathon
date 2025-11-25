const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register user (4-step complete registration)
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      teachTags,
      learnTags,
      location,
      availability,
      bio
    } = req.body;

    // ---------------------------
    //  VALIDATION
    // ---------------------------

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!password || password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ error: "Email already exists" });
    }

    if (!teachTags?.length || !learnTags?.length) {
      return res.status(400).json({
        error: "Please select at least 1 skill to teach and learn"
      });
    }

    // Location must contain lat, lng & areaLabel
    if (
      !location ||
      typeof location !== "object" ||
      !location.lat ||
      !location.lng ||
      !location.areaLabel?.trim()
    ) {
      return res.status(400).json({
        error: "Valid location (lat, lng, areaLabel) is required"
      });
    }

    // ---------------------------
    //  NORMALIZE SKILL TAGS
    // ---------------------------

    const slugify = (s) =>
      String(s)
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    const normalizeTags = (tags) =>
      tags.map((t) => ({
        name: t.trim(),
        slug: slugify(t),
      }));

    const normalizedTeachTags = normalizeTags(teachTags);
    const normalizedLearnTags = normalizeTags(learnTags);

    // ---------------------------
    //  CREATE USER DOCUMENT
    // ---------------------------

    const user = new User({
      name: name.trim(),
      email: email.trim(),
      password,
      bio: bio?.trim() || "",
      availability,
      teachTags: normalizedTeachTags,
      learnTags: normalizedLearnTags,
      location: {
        lat: location.lat,
        lng: location.lng,
        areaLabel: location.areaLabel.trim()
      }
    });

    await user.save();

    const token = generateToken(user._id);

    // ---------------------------
    //  RESPONSE
    // ---------------------------

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        teachTags: user.teachTags,
        learnTags: user.learnTags,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
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
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('allies', 'name profilePhoto');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout (frontend clears token, backend can blacklist if needed)
const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};

// Refresh token
const refreshToken = (req, res) => {
  try {
    const token = generateToken(req.user.userId);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
  changePassword
};