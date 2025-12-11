const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const { sendReportEmail, sendEmail } = require('../utils/emailService');

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

        // Send Email Notification asynchronously
        sendReportEmail({
            reportId: newReport._id,
            reporterId: req.user.userId,
            targetType,
            targetId,
            reason,
            details: details || "No details provided",
            time: new Date().toLocaleString()
        });

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
        const { reportId } = req.params;
        const { status, resolutionNotes } = req.body;

        if (!(await isAdmin(req.user.userId))) {
            return res.status(403).json({ error: 'Admin only' });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        report.status = status || 'resolved';
        if (resolutionNotes) report.details += `\n[Resolution]: ${resolutionNotes}`;

        await report.save();

        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const testEmail = async (req, res) => {
    try {
        const result = await sendEmail({
            to: process.env.EMAIL_USER,
            subject: 'Test Email from Controller (Service Refactor)',
            text: 'If you receive this, the email service refactor is successful.'
        });

        if (result.success) {
            res.json({ success: true, message: 'Email sent successfully', info: result.info });
        } else {
            res.status(500).json({ error: 'Failed to send email', details: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getReports,
    resolveReport,
    createReport,
    testEmail
};
