const Wave = require('../models/Wave');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createWave = async (req, res) => {
    try {
        const { type, caption, textContent, backgroundColor } = req.body;
        const userId = req.user.userId;

        let mediaUrl = null;

        // Upload to Cloudinary if file exists
        if (req.file) {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                resource_type: type === 'video' ? 'video' : 'image',
                folder: 'skillswap/waves'
            });
            mediaUrl = uploadedFile.secure_url;

            // Delete local file after upload
            try {
                if (file?.path) fs.unlinkSync(file.path);
            } catch (e) {
                console.error('Failed to delete local file:', e.message);
            }

        }

        const wave = new Wave({
            userId,
            type,
            mediaUrl,
            caption,
            textContent,
            backgroundColor,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await wave.save();

        res.status(201).json({ success: true, wave });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyWaves = async (req, res) => {
    try {
        const waves = await Wave.find({
            userId: req.user.userId,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json({ success: true, waves });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAlliesWaves = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('allies', '_id');
        const allyIds = user.allies.map(a => a._id);

        const waves = await Wave.find({
            userId: { $in: allyIds },
            expiresAt: { $gt: new Date() }
        })
            .populate('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.json({ success: true, waves });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.viewWave = async (req, res) => {
    try {
        const wave = await Wave.findById(req.params.waveId);
        const userId = req.user.userId;

        if (!wave) {
            return res.status(404).json({ error: 'Wave not found' });
        }

        if (!wave.viewedBy.includes(userId)) {
            wave.viewedBy.push(userId);
            wave.viewCount = wave.viewedBy.length;
            await wave.save();
        }

        res.json({ success: true, wave });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWave = async (req, res) => {
    try {
        const wave = await Wave.findById(req.params.waveId);

        if (!wave) {
            return res.status(404).json({ error: 'Wave not found' });
        }

        if (wave.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Wave.findByIdAndDelete(req.params.waveId);
        res.json({ success: true, message: 'Wave deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;