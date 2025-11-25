const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');

const isAdmin = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return false;
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    return adminEmails.includes(user.email);
};

const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'sj976958@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

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

        // Send Email Notification
        console.log('Attempting to send email...');
        console.log('Sender:', process.env.EMAIL_USER || 'sj976958@gmail.com');
        console.log('Password present:', !!process.env.EMAIL_PASSWORD);

        const mailOptions = {
            from: process.env.EMAIL_USER || 'sj976958@gmail.com',
            to: 'sj976958@gmail.com',
            subject: `New Report: ${reason} (${targetType})`,
            html: `
                <h2>New Report Submitted</h2>
                <p><strong>Reporter ID:</strong> ${req.user.userId}</p>
                <p><strong>Target Type:</strong> ${targetType}</p>
                <p><strong>Target ID:</strong> ${targetId}</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p><strong>Details:</strong> ${details}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        // Send email asynchronously without blocking response
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('CRITICAL: Error sending report email. Check EMAIL_PASSWORD and App Password settings.', error);
            } else {
                console.log('Report email sent successfully:', info.response);
            }
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
        if (!(await isAdmin(req.user.userId))) {
            return res.status(403).json({ error: 'Admin only' });
        }

        // existing logic...
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const testEmail = async (req, res) => {
    try {
        console.log('Testing email from controller...');
        console.log('User:', process.env.EMAIL_USER || 'sj976958@gmail.com');
        console.log('Password present:', !!process.env.EMAIL_PASSWORD);

        const mailOptions = {
            from: process.env.EMAIL_USER || 'sj976958@gmail.com',
            to: 'sj976958@gmail.com',
            subject: 'Test Email from Controller',
            text: 'If you receive this, the controller configuration is correct.'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent:', info.response);
        res.json({ success: true, message: 'Email sent successfully', info });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

module.exports = {
    getReports,
    resolveReport,
    createReport,
    testEmail
};
