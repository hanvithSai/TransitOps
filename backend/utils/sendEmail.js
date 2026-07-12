const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    let transporter;

    // Use SMTP environment variables if provided
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback to Ethereal Email for testing if no SMTP config is provided
        // This is a free open-source service specifically for Nodemailer testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'TransitOps'} <${process.env.FROM_EMAIL || 'noreply@transitops.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
    
    // Log preview URL if using Ethereal
    if (info.messageId && !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
