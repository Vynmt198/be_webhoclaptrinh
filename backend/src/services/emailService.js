const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send password reset email
 * @param {String} to - Recipient email
 * @param {String} fullName - Recipient's name
 * @param {String} resetToken - Plain text reset token (to be included in URL)
 */
const sendPasswordResetEmail = async (to, fullName, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/api/auth/reset-password?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f4f4f4; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; padding: 30px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px 0; }
        .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px;
               border-radius: 5px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        .note { background: #FEF3C7; padding: 12px; border-radius: 5px; color: #92400E; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔒 Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>We received a request to reset your password for your OPLW account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="btn">Reset My Password</a>
          <div class="note">
            ⚠️ This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break:break-all; color: #4F46E5;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© 2024 OPLW – Online Programming Learning Website. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: '[OPLW] Password Reset Request',
        html,
    });
};

/**
 * Send welcome / verification email after registration
 * @param {String} to - Recipient email
 * @param {String} fullName - Recipient's name
 */
const sendWelcomeEmail = async (to, fullName) => {
    const transporter = createTransporter();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f4f4f4; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; padding: 30px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px 0; }
        .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px;
               border-radius: 5px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Welcome to OPLW!</h2>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Thank you for joining <strong>Online Programming Learning Website (OPLW)</strong>! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>🎓 Browse and enroll in programming courses</li>
            <li>📝 Complete coding exercises and quizzes</li>
            <li>📜 Earn certificates upon course completion</li>
            <li>📊 Track your learning progress</li>
          </ul>
          <a href="${process.env.CLIENT_URL}" class="btn">Start Learning Now</a>
        </div>
        <div class="footer">
          <p>© 2024 OPLW – Online Programming Learning Website. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: '[OPLW] Welcome! Your account is ready',
        html,
    });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
