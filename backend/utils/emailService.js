const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
    console.warn('WARNING: EMAIL_USER or EMAIL_PASSWORD environment variables are missing. Email features will NOT work.');
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Use 465 for secure
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass
    },
    // Debugging options for Render
    logger: true,
    debug: true,
    // Increase timeouts
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 20000      // 20 seconds
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        console.log(`[EmailService] Attempting to send email to: ${to}`);

        const mailOptions = {
            from: emailUser,
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent successfully. MessageID: ${info.messageId}`);
        return { success: true, info };
    } catch (error) {
        console.error('[EmailService] CRITICAL Error sending email:', error.message);
        // Log more details if available
        if (error.response) console.error('[EmailService] Response:', error.response);
        if (error.code) console.error('[EmailService] Code:', error.code);

        return { success: false, error: error.message };
    }
};

/**
 * Send Verification Email
 * @param {String} to - User email
 * @param {String} code - 6-digit verification code
 */
const sendVerificationEmail = async (to, code) => {
    const subject = 'Verify your SkillSwap Account';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">Welcome to SkillSwap!</h2>
            <p>Please use the verification code below to activate your account:</p>
            <h1 style="background-color: #f3f4f6; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail({ to, subject, html });
};

/**
 * Send New Report Email (to Admin)
 * @param {Object} reportDetails
 */
const sendReportEmail = async (reportDetails) => {
    const { reportId, reporterId, targetType, targetId, reason, details, time } = reportDetails;
    const adminEmail = process.env.EMAIL_USER; // Default to sender for now, or fetch from env

    const subject = `New Report: ${reason} (${targetType})`;
    const html = `
        <h2>New Report Submitted</h2>
        <p><strong>Report ID:</strong> ${reportId}</p>
        <p><strong>Reporter ID:</strong> ${reporterId}</p>
        <p><strong>Target Type:</strong> ${targetType}</p>
        <p><strong>Target ID:</strong> ${targetId}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Details:</strong> ${details}</p>
        <p><strong>Time:</strong> ${time}</p>
    `;

    // We send to the admin/support email. Using sender email as receiver for now as per previous logic.
    return sendEmail({ to: adminEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendReportEmail
};
