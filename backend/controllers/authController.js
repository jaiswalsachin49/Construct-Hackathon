const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');
const { hasProfanity } = require('../utils/contentFilter');

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

    if (hasProfanity(name)) {
      return res.status(400).json({ error: "Name contains inappropriate language" });
    }

    if (bio && hasProfanity(bio)) {
      return res.status(400).json({ error: "Bio contains inappropriate language" });
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

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

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
      },
      verificationCode,
      isVerified: false
    });

    await user.save();

    // Send Verification Email
    const emailResult = await sendVerificationEmail(user.email, verificationCode);

    // If email sending FAILS, delete the user so they can try again (Atomic-like behavior)
    if (!emailResult.success) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
        details: emailResult.error
      });
    }

    // STRICT VERIFICATION: Do NOT send token. User must verify first.
    // const token = generateToken(user._id);

    // ---------------------------
    //  RESPONSE
    // ---------------------------

    res.status(201).json({
      success: true,
      // token, // OMITTED to enforce verification
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        teachTags: user.teachTags,
        learnTags: user.learnTags,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified
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

    // STRICT VERIFICATION CHECK (Only for new users created after Dec 12, 2025)
    // We strictly enforce this for users created AFTER this feature implementation.
    // Existing users are 'grandfathered' in to avoid lockout.
    const VERIFICATION_ENFORCEMENT_DATE = new Date('2025-12-11T00:00:00.000Z'); // Today

    // Check if user is NEW (created after enforcement date) AND NOT verified
    if (user.createdAt > VERIFICATION_ENFORCEMENT_DATE && !user.isVerified) {
      return res.status(403).json({
        error: 'Account not verified. Please verify your email.',
        isVerified: false
      });
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
        location: user.location,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined; // Clear code after successful verification
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resend Verification Code
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    await user.save();

    // Send email
    await sendVerificationEmail(user.email, verificationCode);

    res.json({ success: true, message: "Verification code resent" });
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
  changePassword,
  verifyEmail,
  resendVerification
};