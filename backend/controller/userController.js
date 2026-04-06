
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../model/User.js');
const PendingRegistration = require('./../model/PendingRegistration.js');
const { generateOtp } = require('../utils/otp');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
require('dotenv').config();

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      address,
      city,
      specialization,
      role,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !address || !city) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    if (role === 'doctor' && !specialization) {
      return res.status(400).json({ error: 'Specialization required for doctors' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in Users table
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with that email already exists' });
    }

    // Check if there's already a pending registration with this email
    const existingPending = await PendingRegistration.findOne({ where: { email: normalizedEmail } });
    if (existingPending) {
      // Delete old pending registration
      await existingPending.destroy();
      console.log('🗑️  Removed old pending registration for:', normalizedEmail);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate email verification OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create pending registration (NOT in Users table yet)
    const pendingRegistration = await PendingRegistration.create({
      fullName,
      email: normalizedEmail,
      phone,
      passwordHash,
      address,
      city,
      specialization: role === 'doctor' ? specialization : null,
      role,
      otpHash,
      otpExpiresAt,
      otpSentAt: new Date(),
      verificationToken,
    });

    console.log('📝 Pending registration created:', normalizedEmail, '- Role:', role);

    // Send verification email (don't fail registration if email fails)
    const emailResult = await sendVerificationEmail(normalizedEmail, otp, fullName);
    
    if (!emailResult.success) {
      console.warn('⚠️  Email sending failed for:', normalizedEmail);
      console.warn('   OTP generated but not sent. User can request resend.');
    }

    return res.status(201).json({
      message: emailResult.success 
        ? 'Registration initiated. Please check your email for verification code.'
        : 'Registration initiated. Email service unavailable - please use resend OTP.',
      verificationToken, // Send this to frontend for OTP verification
      email: normalizedEmail,
      emailSent: emailResult.success,
      warning: emailResult.success ? null : 'Email service unavailable. Please use resend OTP button.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ User logged in:', normalizedEmail, '- Role:', user.role);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Request password reset with OTP
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset code.' 
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    await user.update({
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: otpExpiresAt,
      passwordResetOtpSentAt: new Date(),
    });

    console.log('🔑 Password reset OTP requested for:', normalizedEmail);

    // Send reset email with OTP
    const emailResult = await sendPasswordResetEmail(normalizedEmail, otp, user.fullName);
    
    if (!emailResult.success) {
      console.warn('⚠️  Failed to send password reset email');
      return res.status(500).json({ error: 'Failed to send password reset code. Please try again.' });
    }

    res.json({ 
      message: 'Password reset code has been sent to your email.',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP and reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or OTP' });
    }

    // Check if OTP exists and not expired
    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ error: 'No password reset request found. Please request a new code.' });
    }

    if (new Date() > user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset OTP
    await user.update({
      passwordHash,
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
      passwordResetOtpSentAt: null,
    });

    console.log('✅ Password reset successful for:', user.email);

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, requestPasswordReset, resetPassword };
