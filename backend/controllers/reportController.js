const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');

const isAdmin = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return false;
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    return adminEmails.includes(user.email);
};

const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, details } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ error: 'targetType, targetId, and reason are required' });
        }

        if (!['user', 'post', 'comment'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid targetType. Must be user, post, or comment' });
        }

        const newReport = new Report({
            reporterId: req.user.userId,
            targetType,
            targetId,
            reason,
            details: details || "",
            status: "pending",
            createdAt: new Date()
        });

        await newReport.save();

        res.json({
            success: true,
            report: newReport,
            message: "Report submitted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        if (!(await isAdmin(req.user.userId))) {
            return res.status(403).json({ error: 'Admin only' });
        }

        const reports = await Report.find()
            .populate('reporterId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resolveReport = async (req, res) => {
    try {
        if (!(await isAdmin(req.user.userId))) {
            return res.status(403).json({ error: 'Admin only' });
        }

        // existing logic...
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getReports,
    resolveReport,
    createReport
};
