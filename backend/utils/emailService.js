const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    // Check if SMTP credentials are set
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('================================================');
        console.log(`[MOCK EMAIL] To: ${to}`);
        console.log(`[MOCK EMAIL] Subject: ${subject}`);
        console.log(`[MOCK EMAIL] Body: ${text}`);
        console.log('================================================');
        console.log('To send real emails, please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Zacx Support" <no-reply@zacx.io>',
            to,
            subject,
            text,
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to console log in dev
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[FALLBACK EMAIL] To: ${to}, Body: ${text}`);
        }
    }
};

module.exports = sendEmail;
