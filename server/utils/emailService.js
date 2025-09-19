const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps with some SMTP server issues
  }
});

// Verify connection configuration
const verifyEmailConnection = async () => {
  try {
    console.log('Testing email connection...');
    console.log('Email Service:', process.env.EMAIL_SERVICE);
    console.log('Email User:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'NOT SET');
    console.log('Email Pass:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
    
    await transporter.verify();
    console.log('✅ SMTP server is ready to send messages!');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection error:', error.message);
    console.log('📧 Email configuration troubleshooting:');
    console.log('   1. Check if EMAIL_USER is correct');
    console.log('   2. Check if EMAIL_PASS is a valid Gmail App Password');
    console.log('   3. Make sure 2FA is enabled on your Gmail account');
    console.log('   4. Try generating a new App Password');
    return false;
  }
};

// Test connection on startup
verifyEmailConnection();

/**
 * Generate a verification token
 * @returns {string} - Random verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send email verification email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} token - Verification token
 * @returns {Promise} - Promise object representing the email sending operation
 */
const sendVerificationEmail = async (to, name, token) => {
  try {
    console.log(`📧 Attempting to send verification email to: ${to}`);
    
    // First verify connection
    const connectionOk = await verifyEmailConnection();
    if (!connectionOk) {
      throw new Error('SMTP connection failed. Please check email configuration.');
    }
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
    
    const mailOptions = {
      from: `"Twiller Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to Twiller - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1da1f2;">Twiller</h1>
          </div>
          <h2>Welcome to Twiller, ${name}!</h2>
          <p>Thank you for signing up! To complete your registration and start using Twiller, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1da1f2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1da1f2;">${verificationUrl}</p>
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          <p>If you didn't create a Twiller account, you can safely ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #657786; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Twiller. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Welcome to Twiller, ${name}!
        
        Thank you for signing up! Please verify your email address by clicking this link:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create a Twiller account, you can safely ignore this email.
      `
    };

    console.log(`🚀 Sending email with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    let userFriendlyMessage = 'Failed to send verification email. ';
    
    if (error.code === 'EAUTH') {
      userFriendlyMessage += 'Email authentication failed. Please check your Gmail app password.';
    } else if (error.code === 'ECONNECTION') {
      userFriendlyMessage += 'Could not connect to email server. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      userFriendlyMessage += 'Email sending timed out. Please try again.';
    } else {
      userFriendlyMessage += 'Please check your email configuration and try again.';
    }
    
    return { success: false, error: error.message, userMessage: userFriendlyMessage };
  }
};

/**
 * Send OTP email for login verification
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Promise object representing the email sending operation
 */
const sendOTPEmail = async (to, otp) => {
  try {
    console.log(`📧 Attempting to send login OTP to: ${to}`);
    
    // First verify connection
    const connectionOk = await verifyEmailConnection();
    if (!connectionOk) {
      throw new Error('SMTP connection failed. Please check email configuration.');
    }
    
    const mailOptions = {
      from: `"Twiller Security" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Twiller - Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1da1f2;">Twiller</h1>
          </div>
          <h2>Login Verification Required</h2>
          <p>We detected a login attempt from a Chrome browser. For your security, please enter the verification code below:</p>
          <div style="background-color: #e8f5fd; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; color: #1da1f2; margin: 0; letter-spacing: 5px;">${otp}</p>
          </div>
          <p><strong>This verification code will expire in 10 minutes.</strong></p>
          <p>If you did not attempt to log in, please secure your account immediately by changing your password.</p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> Chrome browser requires additional verification for enhanced account security.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #657786; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Twiller. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Twiller Login Verification
        
        We detected a login attempt from a Chrome browser. For your security, please enter this verification code:
        
        ${otp}
        
        This code will expire in 10 minutes.
        
        If you did not attempt to log in, please secure your account immediately.
      `
    };

    console.log(`🚀 Sending OTP email with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('Error message:', error.message);
    
    let userFriendlyMessage = 'Failed to send OTP email. ';
    
    if (error.code === 'EAUTH') {
      userFriendlyMessage += 'Email authentication failed. Please check your Gmail app password.';
    } else if (error.code === 'ECONNECTION') {
      userFriendlyMessage += 'Could not connect to email server. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      userFriendlyMessage += 'Email sending timed out. Please try again.';
    } else {
      userFriendlyMessage += 'Please check your email configuration and try again.';
    }
    
    return { success: false, error: error.message, userMessage: userFriendlyMessage };
  }
};

/**
 * Send password reset email with secure link
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Secure reset token
 * @returns {Promise} - Promise object representing the email sending operation
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    console.log(`📧 Attempting to send password reset email to: ${to}`);
    
    // First verify connection
    const connectionOk = await verifyEmailConnection();
    if (!connectionOk) {
      throw new Error('SMTP connection failed. Please check email configuration.');
    }
    
    // Create the reset link
    const baseUrl = process.env.FRONTEND_URL || 'http://192.168.29.125:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Twiller Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Twiller - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1da1f2;">Twiller</h1>
          </div>
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Twiller account. If you made this request, please click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #1da1f2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">Reset Your Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all;">
            <a href="${resetLink}" style="color: #1da1f2; text-decoration: none;">${resetLink}</a>
          </div>
          
          <p><strong>Important Security Information:</strong></p>
          <ul style="line-height: 1.6;">
            <li>This link will expire in 1 hour for your security</li>
            <li>If you didn't request this password reset, you can safely ignore this email</li>
            <li>Never share this link with anyone</li>
            <li>We will never ask for your password via email</li>
          </ul>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> If you did not request this password reset, please secure your account immediately by changing your password.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #657786; font-size: 12px;">
            <p>This email was sent to ${to}</p>
            <p>© ${new Date().getFullYear()} Twiller. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Twiller Password Reset Request
        
        Hello,
        
        We received a request to reset your password for your Twiller account.
        
        To reset your password, click this link or copy it into your browser:
        ${resetLink}
        
        Important:
        - This link will expire in 1 hour for your security
        - If you didn't request this password reset, you can safely ignore this email
        - Never share this link with anyone
        
        If you did not request this password reset, please secure your account immediately.
        
        © ${new Date().getFullYear()} Twiller. All rights reserved.
      `
    };

    console.log(`🚀 Sending password reset email with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('❌ Error sending password reset email:');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    let userFriendlyMessage = 'Failed to send password reset email. ';
    
    if (error.code === 'EAUTH') {
      userFriendlyMessage += 'Email authentication failed. Please check your Gmail app password.';
    } else if (error.code === 'ECONNECTION') {
      userFriendlyMessage += 'Could not connect to email server. Please check your internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      userFriendlyMessage += 'Email sending timed out. Please try again.';
    } else {
      userFriendlyMessage += 'Please check your email configuration and try again.';
    }
    
    return { success: false, error: error.message, userMessage: userFriendlyMessage };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  generateVerificationToken
};
