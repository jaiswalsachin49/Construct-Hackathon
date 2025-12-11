const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND_API; // Support both naming conventions

// Initialize Resend if API key is present
let resend;
if (resendApiKey) {
    resend = new Resend(resendApiKey);
    console.log('[EmailService] Resend API initialized');
}

// Fallback to Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPass
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 20000,
    // Force IPv4 (Fixes timeouts on some cloud providers like Render)
    family: 4
});

if (!resendApiKey) {
    console.log('[EmailService] Using Nodemailer SMTP (Gmail Port 587)');
}

if (!resendApiKey && (!emailUser || !emailPass)) {
    console.warn('WARNING: No Email credentials found (Resend or Gmail). Email features will NOT work.');
}

/**
 * Send an email using Resend (priority) or Nodemailer (fallback)
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
    // ----------------------
    // 1. Try RESEND API
    // ----------------------
    if (resend) {
        try {
            console.log(`[EmailService] Attempting to send via Resend to: ${to}`);
            const data = await resend.emails.send({
                from: 'SkillSwap <onboarding@resend.dev>', // Default Resend testing domain. User should update this for prod.
                to: to,
                subject: subject,
                html: html,
                text: text
            });

            if (data.error) {
                console.error('[EmailService] Resend API Error:', data.error);
                throw new Error(data.error.message);
            }

            console.log(`[EmailService] Email sent via Resend. ID: ${data.data?.id}`);
            return { success: true, id: data.data?.id, provider: 'resend' };
        } catch (error) {
            console.error('[EmailService] Resend failed, falling back to SMTP if available. Error:', error.message);
            // If Resend fails, we can fall back to Nodemailer below if configured
            if (!emailUser || !emailPass) {
                return { success: false, error: error.message };
            }
        }
    }

    // ----------------------
    // 2. Fallback to NODEMAILER
    // ----------------------
    try {
        console.log(`[EmailService] Attempting to send via SMTP (Nodemailer) to: ${to}`);
        const mailOptions = {
            from: emailUser,
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent via SMTP. MessageID: ${info.messageId}`);
        return { success: true, info, provider: 'smtp' };
    } catch (error) {
        console.error('[EmailService] SMTP validation failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Verification Email
 */
const sendVerificationEmail = async (to, code) => {
    const subject = 'Verify your SkillSwap Account';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; color: #374151; text-align: center; }
            .code-box { background-color: #F3F4F6; border: 2px dashed #E5E7EB; border-radius: 8px; padding: 20px; margin: 30px 0; display: inline-block; }
            .code { font-size: 32px; font-weight: 700; color: #4F46E5; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace; }
            .footer { background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
            .note { font-size: 14px; color: #6B7280; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to SkillSwap!</h1>
            </div>
            <div class="content">
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    Thanks for joining us! Please use the verification code below to activate your account and start your learning journey.
                </p>
                
                <div class="code-box">
                    <p class="code">${code}</p>
                </div>

                <p class="note">This code will expire in 24 hours.</p>
                <p class="note" style="margin-top: 10px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SkillSwap. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return sendEmail({ to, subject, html });
};

/**
 * Send New Report Email (to Admin)
 */
const sendReportEmail = async (reportDetails) => {
    const { reportId, reporterId, targetType, targetId, reason, details, time } = reportDetails;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const subject = `[Action Required] New Report: ${reason} (${targetType})`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; background-color: #f9fafb; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 5px solid #EF4444; overflow: hidden; }
            .header { background-color: #FEF2F2; padding: 20px; border-bottom: 1px solid #FEE2E2; }
            .header h2 { margin: 0; color: #991B1B; font-size: 20px; display: flex; align-items: center; gap: 10px; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-size: 12px; text-transform: uppercase; color: #6B7280; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 15px; color: #111827; font-weight: 500; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; background-color: #E5E7EB; color: #374151; }
            .badge.user { background-color: #DBEAFE; color: #1E40AF; }
            .badge.post { background-color: #D1FAE5; color: #065F46; }
            .details-box { background-color: #F3F4F6; padding: 15px; border-radius: 6px; font-size: 14px; color: #374151; line-height: 1.5; margin-top: 5px; }
            .footer { padding: 15px 20px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; text-align: center; }
            .btn { display: inline-block; background-color: #EF4444; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 10px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h2>⚠️ New Content Report</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Report ID</div>
                    <div class="value">${reportId}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="field">
                        <div class="label">Target Type</div>
                        <span class="badge ${targetType.toLowerCase()}">${targetType}</span>
                    </div>
                    <div class="field">
                        <div class="label">Target ID</div>
                        <div class="value" style="font-family: monospace;">${targetId}</div>
                    </div>
                </div>

                <div class="field">
                    <div class="label">Reason</div>
                    <div class="value" style="color: #DC2626;">${reason}</div>
                </div>

                <div class="field">
                    <div class="label">Reporter Details</div>
                    <div class="value" style="font-size: 14px; color: #4B5563;">
                        Reporter ID: ${reporterId}<br>
                        Time: ${new Date(time).toLocaleString()}
                    </div>
                </div>

                <div class="field">
                    <div class="label">Additional Details</div>
                    <div class="details-box">
                        ${details || 'No additional details provided.'}
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL}/admin/reports/${reportId}" class="btn">View & Resolve Report</a>
                </div>
            </div>
            <div class="footer">
                Construct Hackathon Safety System
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({ to: adminEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendReportEmail
};
