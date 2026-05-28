const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Appointment, DoctorSchedule, PendingRegistration, DoctorAvailability, AppointmentNote, PatientNotification, DoctorProfile } = require('../model/associations');
const { generateOtp } = require('../utils/otp');
const { sendVerificationEmail, sendAppointmentConfirmation } = require('../utils/emailService');
const { Op } = require('sequelize');

// Verify email with OTP and create user account
const verifyEmail = async (req, res) => {
  try {
    const { email, otp, verificationToken } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    if (!verificationToken) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({ 
      where: { 
        email: normalizedEmail,
        verificationToken 
      } 
    });

    if (!pendingReg) {
      return res.status(404).json({ error: 'Registration not found or expired. Please register again.' });
    }

    // Check if OTP is expired
    if (new Date() > pendingReg.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, pendingReg.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if user already exists (in case of race condition)
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      // Clean up pending registration
      await pendingReg.destroy();
      return res.status(409).json({ error: 'User already exists. Please login.' });
    }

    // Create user account (NOW we create the user!)
    const newUser = await User.create({
      fullName: pendingReg.fullName,
      email: pendingReg.email,
      phone: pendingReg.phone,
      passwordHash: pendingReg.passwordHash,
      address: pendingReg.address,
      city: pendingReg.city,
      specialization: pendingReg.specialization,
      role: pendingReg.role,
      emailVerified: true, // Already verified!
      emailVerificationOtpHash: null,
      emailVerificationOtpExpiresAt: null,
    });

    console.log('✅ User account created after OTP verification:', normalizedEmail, '- Role:', newUser.role);

    // Delete pending registration
    await pendingReg.destroy();
    console.log('🗑️  Pending registration removed for:', normalizedEmail);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Email verified successfully! Your account has been created.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email: ' + error.message });
  }
};

// Change email and resend OTP (for pending registrations)
const changeEmailAndResendOtp = async (req, res) => {
  try {
    const { oldEmail, newEmail, verificationToken } = req.body;

    if (!oldEmail || !newEmail || !verificationToken) {
      return res.status(400).json({ error: 'Old email, new email, and verification token are required' });
    }

    // Validate new email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Normalize emails
    const normalizedOldEmail = oldEmail.trim().toLowerCase();
    const normalizedNewEmail = newEmail.trim().toLowerCase();

    // Check if emails are the same
    if (normalizedOldEmail === normalizedNewEmail) {
      return res.status(400).json({ error: 'New email must be different from current email' });
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({ 
      where: { 
        email: normalizedOldEmail,
        verificationToken
      } 
    });

    if (!pendingReg) {
      console.error('Pending registration not found with email:', normalizedOldEmail);
      return res.status(404).json({ error: 'Registration not found. Please start registration again.' });
    }

    // Check if new email already exists in Users table
    const existingUser = await User.findOne({ 
      where: { 
        email: normalizedNewEmail
      } 
    });

    if (existingUser) {
      return res.status(409).json({ error: 'This email is already registered' });
    }

    // Check if new email exists in pending registrations
    const existingPending = await PendingRegistration.findOne({ 
      where: { 
        email: normalizedNewEmail,
        verificationToken: { [Op.ne]: verificationToken }
      } 
    });

    if (existingPending) {
      return res.status(409).json({ error: 'This email is already in use for another pending registration' });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update pending registration with new email and OTP
    await pendingReg.update({
      email: normalizedNewEmail,
      otpHash,
      otpExpiresAt: expiresAt,
      otpSentAt: new Date(),
    });

    console.log('✅ Email updated in pending registration from', normalizedOldEmail, 'to', normalizedNewEmail);

    // Send email to new address
    const emailResult = await sendVerificationEmail(normalizedNewEmail, otp, pendingReg.fullName);
    
    if (!emailResult.success) {
      console.warn('⚠️  Email sending failed but pending registration email was updated');
      return res.json({ 
        message: 'Email updated successfully. However, email sending failed. Please use resend OTP.',
        newEmail: normalizedNewEmail,
        emailSent: false,
        warning: 'Email service unavailable. OTP was generated but not sent.'
      });
    }

    res.json({ 
      message: 'Email updated successfully. New OTP sent to updated email address.',
      newEmail: normalizedNewEmail,
      emailSent: true
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ error: 'Failed to change email: ' + error.message });
  }
};

// Resend verification email (for pending registrations)
const resendVerificationEmail = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    if (!email || !verificationToken) {
      return res.status(400).json({ error: 'Email and verification token are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({
      where: {
        email: normalizedEmail,
        verificationToken
      }
    });

    if (!pendingReg) {
      return res.status(404).json({ error: 'Registration not found. Please register again.' });
    }

    // Check rate limiting (1 minute between sends)
    if (pendingReg.otpSentAt) {
      const timeSinceLastSend = new Date() - new Date(pendingReg.otpSentAt);
      if (timeSinceLastSend < 60000) { // 1 minute
        return res.status(429).json({ error: 'Please wait before requesting another OTP' });
      }
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update pending registration with new OTP
    await pendingReg.update({
      otpHash,
      otpExpiresAt: expiresAt,
      otpSentAt: new Date(),
    });

    // Send email
    const emailResult = await sendVerificationEmail(pendingReg.email, otp, pendingReg.fullName);
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

// Get patient profile
const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'phone', 'address', 'city', 'emailVerified'],
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
};

// Update patient profile
const updatePatientProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city } = req.body;

    const patient = await User.findByPk(req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await patient.update({
      fullName: fullName || patient.fullName,
      phone: phone || patient.phone,
      address: address || patient.address,
      city: city || patient.city,
    });

    res.json({
      message: 'Profile updated successfully',
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        city: patient.city,
      },
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, city } = req.query;
    
    let whereClause = { 
      role: 'doctor',
      emailVerified: true,
    };
    
    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` };
    }

    const doctors = await User.findAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'specialization', 'city'],
      include: [
        {
          model: DoctorSchedule,
          as: 'schedule',
          attributes: ['dayOfWeek', 'startTime', 'endTime', 'isAvailable'],
          where: { isAvailable: true },
          required: false,
        },
        {
          model: DoctorProfile,
          as: 'profile',
          attributes: ['consultationFee', 'experience', 'bio'],
          required: false,
        },
      ],
    });

    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findOne({
      where: { id, role: 'doctor', emailVerified: true },
      attributes: ['id', 'fullName', 'specialization'],
      include: [
        {
          model: DoctorSchedule,
          as: 'schedule',
          where: { isAvailable: true },
          required: false,
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor schedule' });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, consultationType } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Doctor, date, and time are required' });
    }

    // Verify patient is email verified
    const patient = await User.findByPk(req.user.id);
    if (!patient.emailVerified) {
      return res.status(400).json({ error: 'Please verify your email before booking appointments' });
    }

    // Verify doctor exists and is available
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor', emailVerified: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: { [Op.notIn]: ['cancelled'] },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      consultationType: consultationType || 'online',
      status: 'pending',
    });

    // Send confirmation email
    const emailResult = await sendAppointmentConfirmation(
      patient.email,
      doctor.fullName,
      appointmentDate,
      appointmentTime,
      patient.fullName
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

// Get patient appointments
const getPatientAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    
    let whereClause = { patientId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fullName', 'specialization'],
        },
        {
          model: AppointmentNote,
          as: 'note',
          required: false,
        },
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: { id, patientId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment already cancelled' });
    }

    await appointment.update({ status: 'cancelled' });

    res.json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// Get patient medical records
const getPatientMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { MedicalRecord } = require('../model/associations');

    // Fetch all medical records for the patient
    const records = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fullName', 'specialization'],
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'appointmentTime', 'reason'],
        },
      ],
      order: [['recordDate', 'DESC']],
    });

    // Parse JSON fields
    const formattedRecords = records.map(record => {
      const recordData = record.toJSON();
      return {
        ...recordData,
        prescriptions: recordData.prescriptions ? JSON.parse(recordData.prescriptions) : null,
        labResults: recordData.labResults ? JSON.parse(recordData.labResults) : null,
        vitals: recordData.vitals ? JSON.parse(recordData.vitals) : null,
        attachments: recordData.attachments ? JSON.parse(recordData.attachments) : null,
      };
    });

    res.json({ records: formattedRecords });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};

// Get single medical record by ID
const getMedicalRecordById = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { recordId } = req.params;

    const { MedicalRecord } = require('../model/associations');

    const record = await MedicalRecord.findOne({
      where: { 
        id: recordId,
        patientId // Ensure patient can only access their own records
      },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fullName', 'specialization', 'email', 'phone'],
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'appointmentTime', 'reason', 'status'],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Parse JSON fields
    const recordData = record.toJSON();
    const formattedRecord = {
      ...recordData,
      prescriptions: recordData.prescriptions ? JSON.parse(recordData.prescriptions) : null,
      labResults: recordData.labResults ? JSON.parse(recordData.labResults) : null,
      vitals: recordData.vitals ? JSON.parse(recordData.vitals) : null,
      attachments: recordData.attachments ? JSON.parse(recordData.attachments) : null,
    };

    res.json({ record: formattedRecord });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
};

// Get patient notifications
const getPatientNotifications = async (req, res) => {
  try {
    const notifications = await PatientNotification.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark single notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await PatientNotification.update(
      { isRead: true },
      { where: { id, patientId: req.user.id } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
  try {
    await PatientNotification.update(
      { isRead: true },
      { where: { patientId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

module.exports = {
  verifyEmail,
  changeEmailAndResendOtp,
  resendVerificationEmail,
  getPatientProfile,
  updatePatientProfile,
  getAllDoctors,
  getDoctorSchedule,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getPatientMedicalRecords,
  getMedicalRecordById,
  getPatientNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};