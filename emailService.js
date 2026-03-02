const nodemailer = require('nodemailer');

// Email configuration
// For production, use environment variables
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@scholarship.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@scholarship.com';

// Create transporter
let transporter;

function initializeTransporter() {
    try {
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
        console.log('Email service initialized');
    } catch (error) {
        console.error('Failed to initialize email service:', error);
        console.log('Email notifications will be logged to console instead');
    }
}

initializeTransporter();

// Send confirmation email to applicant
async function sendConfirmationEmail(toEmail, fullName, applicationId) {
    const subject = 'Scholarship Application Received';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
                .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Application Received!</h1>
                </div>
                <div class="content">
                    <p>Dear ${fullName},</p>
                    
                    <p>Thank you for submitting your scholarship application. We have successfully received your application and it is now under review.</p>
                    
                    <div class="details">
                        <strong>Application Details:</strong><br>
                        Application ID: <strong>#${applicationId}</strong><br>
                        Status: <strong>Pending Review</strong><br>
                        Submitted: <strong>${new Date().toLocaleDateString()}</strong>
                    </div>
                    
                    <p>Our review committee will carefully evaluate your application. You can expect to hear back from us within 2-3 weeks.</p>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>Your application will be reviewed by our committee</li>
                        <li>We may contact you if additional information is needed</li>
                        <li>You will receive an email notification about the decision</li>
                    </ul>
                    
                    <p>Please keep your Application ID (#${applicationId}) for your records.</p>
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p>Best regards,<br>
                    <strong>Scholarship Committee</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Scholarship Portal. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(toEmail, subject, html);
}

// Send notification to admin
async function sendAdminNotification(applicantName, applicationId) {
    const subject = `New Scholarship Application - ${applicantName}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔔 New Application Alert</h2>
                </div>
                <div class="content">
                    <div class="alert">
                        <strong>New scholarship application received!</strong>
                    </div>
                    
                    <p><strong>Applicant:</strong> ${applicantName}<br>
                    <strong>Application ID:</strong> #${applicationId}<br>
                    <strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    
                    <p>A new scholarship application has been submitted and is awaiting review.</p>
                    
                    <a href="http://localhost:3000/admin.html" class="button">Review Application</a>
                    
                    <p>Please log in to the admin panel to view the full application details.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(ADMIN_EMAIL, subject, html);
}

// Send status update email to applicant
async function sendStatusUpdateEmail(toEmail, fullName, status, applicationId) {
    let statusText, statusColor, message;

    switch(status) {
        case 'approved':
            statusText = 'Approved ✓';
            statusColor = '#28a745';
            message = `
                <p>Congratulations! We are pleased to inform you that your scholarship application has been <strong>approved</strong>.</p>
                <p>This is a significant achievement and we are excited to support your educational journey.</p>
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>You will receive detailed information about the scholarship within 3-5 business days</li>
                    <li>Please prepare the necessary documentation as requested</li>
                    <li>Our team will contact you regarding the disbursement process</li>
                </ul>
            `;
            break;
        case 'rejected':
            statusText = 'Not Selected';
            statusColor = '#dc3545';
            message = `
                <p>Thank you for your interest in our scholarship program. After careful consideration, we regret to inform you that we are unable to approve your application at this time.</p>
                <p>We received many qualified applications and the selection process was highly competitive. We encourage you to:</p>
                <ul>
                    <li>Apply for other scholarship opportunities</li>
                    <li>Consider reapplying in the next application cycle</li>
                    <li>Continue pursuing your educational goals</li>
                </ul>
                <p>We wish you the very best in your academic endeavors.</p>
            `;
            break;
        default:
            statusText = status;
            statusColor = '#667eea';
            message = `<p>Your application status has been updated to: <strong>${status}</strong></p>`;
    }

    const subject = `Scholarship Application Update - ${statusText}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid ${statusColor}; }
                .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Application Status Update</h1>
                </div>
                <div class="content">
                    <p>Dear ${fullName},</p>
                    
                    <div class="status-box">
                        <strong>Application ID:</strong> #${applicationId}<br>
                        <strong>New Status:</strong> <span style="color: ${statusColor}; font-size: 18px;"><strong>${statusText}</strong></span><br>
                        <strong>Updated:</strong> ${new Date().toLocaleString()}
                    </div>
                    
                    ${message}
                    
                    <p>If you have any questions, please feel free to contact us.</p>
                    
                    <p>Best regards,<br>
                    <strong>Scholarship Committee</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Scholarship Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(toEmail, subject, html);
}

// Generic send email function
async function sendEmail(to, subject, html) {
    if (!transporter) {
        // If email service is not configured, log to console
        console.log('\n=== EMAIL NOTIFICATION ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('=========================\n');
        return { success: true, message: 'Email logged (service not configured)' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Scholarship Portal" <${FROM_EMAIL}>`,
            to: to,
            subject: subject,
            html: html
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        // Log to console as fallback
        console.log('\n=== EMAIL NOTIFICATION (FALLBACK) ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('=====================================\n');
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendConfirmationEmail,
    sendAdminNotification,
    sendStatusUpdateEmail
};
