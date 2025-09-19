const twilio = require('twilio');
require('dotenv').config();

// Create a Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send password reset SMS
 * @param {string} to - Recipient phone number (must be in E.164 format, e.g., +1234567890)
 * @param {string} password - Generated password
 * @returns {Promise} - Promise object representing the SMS sending operation
 */
const sendPasswordResetSMS = async (to, password) => {
  try {
    // Format phone number to E.164 format if not already
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      // Assuming US numbers if no country code provided
      formattedNumber = `+1${to.replace(/\D/g, '')}`;
    }

    const message = await client.messages.create({
      body: `Your Twiller password has been reset. Your temporary password is: ${password}. For security reasons, please change your password after logging in.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('Password reset SMS sent:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending password reset SMS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetSMS
};