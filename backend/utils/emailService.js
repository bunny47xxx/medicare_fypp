const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Verify connection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.warn('⚠️  SMTP connection failed (emails will not be sent):', error.message);
    console.warn('   Please check your SMTP credentials in .env file');
    return false;
  }
};

// Send email verification OTP
const sendVerificationEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: `"Medicare System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Email Verification - Medicare System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Medicare System - Email Verification</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering with Medicare System. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2c5aa0; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    console.error('   Email:', email);
    console.error('   Error details:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, doctorName, appointmentDate, appointmentTime, patientName) => {
  try {
    // Format date nicely
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format time (convert 24h to 12h format)
    const formatTime = (time) => {
      if (!time) return 'Not specified';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const formattedTime = formatTime(appointmentTime);

    const mailOptions = {
      from: `"Medicare System" <${process.env.SMTP_USER}>`,
      to: patientEmail,
      subject: 'Appointment Confirmation - Medicare System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Appointment Confirmed</h2>
          <p>Hello ${patientName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
            <p style="margin: 10px 0;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> <span style="color: #2c5aa0; font-size: 18px; font-weight: bold;">${formattedTime}</span></p>
          </div>
          <p>Please arrive 15 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Appointment confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send appointment confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send password reset email with OTP
const sendPasswordResetEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: `"Medicare System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Code - Medicare System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Password Reset Request</h2>
          <p>Hello ${fullName},</p>
          <p>We received a request to reset your password for your Medicare System account.</p>
          <p>Please use the following code to reset your password:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2c5aa0; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyConnection,
  sendVerificationEmail,
  sendAppointmentConfirmation,
  sendPasswordResetEmail,
};