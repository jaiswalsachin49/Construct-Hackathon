const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');

exports.createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, details } = req.body;

        // Validation
        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ error: 'targetType, targetId, and reason are required' });
        }

        if (!['user', 'post', 'comment'].includes(targetType)) {
            return res.status(400).json({ error: 'Invalid targetType. Must be user, post, or comment' });
        }

        // Check if already reported by this user
        const existingReport = await Report.findOne({
            reporterId: req.user.userId,
            targetType,
            targetId,
            status: 'pending'
        });

        if (existingReport) {
            return res.status(400).json({ error: 'You have already reported this' });
        }

        const report = new Report({
            reporterId: req.user.userId,
            targetType,
            targetId,
            reason,
            details: details || ''
        });

        await report.save();

        // Auto-flag if 3+ reports on same target
        if (targetType === 'user') {
            const reportCount = await Report.countDocuments({
                targetType: 'user',
                targetId,
                status: 'pending'
            });

            if (reportCount >= 3) {
                await User.findByIdAndUpdate(targetId, {
                    $set: { flagged: true }
                });
                console.log(`User ${targetId} has been auto-flagged due to ${reportCount} reports`);
            }
        }

        res.status(201).json({ success: true, report, message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        // Note: In production, you should add admin role check here
        // For now, any authenticated user can view reports

        const query = {};
        if (status) {
            query.status = status;
        }

        const reports = await Report.find(query)
            .populate('reporterId', 'name email profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReports = await Report.countDocuments(query);

        res.json({
            success: true,
            reports,
            pagination: {
                total: totalReports,
                page: parseInt(page),
                pages: Math.ceil(totalReports / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { resolution, action } = req.body;

        if (!resolution) {
            return res.status(400).json({ error: 'Resolution details required' });
        }

        // Note: In production, you should add admin role check here

        const report = await Report.findByIdAndUpdate(
            req.params.reportId,
            {
                status: 'resolved',
                resolution
            },
            { new: true }
        ).populate('reporterId', 'name email');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Optional: Take action based on resolution
        if (action === 'ban' && report.targetType === 'user') {
            await User.findByIdAndUpdate(report.targetId, {
                $set: { banned: true, bannedAt: new Date() }
            });
        }

        if (action === 'remove' && report.targetType === 'post') {
            await Post.findByIdAndDelete(report.targetId);
        }

        res.json({ success: true, report, message: 'Report resolved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;