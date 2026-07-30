const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

const sendEmail = async (options) => {
  const hasSmtp = hasSmtpConfig();

  if (!hasSmtp && process.env.NODE_ENV === "production") {
    throw new Error("SMTP is not configured. Cannot send email in production.");
  }

  let transporter;

  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_PORT) === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
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
    from: `${process.env.FROM_NAME || "TransitOps"} <${process.env.FROM_EMAIL || "noreply@transitops.com"}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  const previewUrl = !hasSmtp ? nodemailer.getTestMessageUrl(info) : null;

  if (previewUrl) {
    console.log("[Email Dev Fallback] Preview URL:", previewUrl);
  } else {
    console.log("Message sent: %s", info.messageId);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    isDevFallback: !hasSmtp,
  };
};

module.exports = sendEmail;
module.exports.hasSmtpConfig = hasSmtpConfig;
