const express = require('express');
const { authenticateToken, requirePatient } = require('../middleware/auth');
const {
  getPatientProfile,
  updatePatientProfile,
  getAllDoctors,
  getDoctorSchedule,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  verifyEmail,
  resendVerificationEmail,
  changeEmailAndResendOtp,
  getPatientMedicalRecords,
  getMedicalRecordById,
} = require('../controller/patientController');

const router = express.Router();

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/change-email', changeEmailAndResendOtp);
router.post('/resend-verification', resendVerificationEmail); // No auth required

// Patient profile
router.get('/profile', authenticateToken, requirePatient, getPatientProfile);
router.put('/profile', authenticateToken, requirePatient, updatePatientProfile);

// Doctor discovery
router.get('/doctors', authenticateToken, requirePatient, getAllDoctors);
router.get('/doctors/:id/schedule', authenticateToken, requirePatient, getDoctorSchedule);

// Appointment management
router.post('/appointments', authenticateToken, requirePatient, bookAppointment);
router.get('/appointments', authenticateToken, requirePatient, getPatientAppointments);
router.put('/appointments/:id/cancel', authenticateToken, requirePatient, cancelAppointment);

// Medical records
router.get('/medical-records', authenticateToken, requirePatient, getPatientMedicalRecords);
router.get('/medical-records/:recordId', authenticateToken, requirePatient, getMedicalRecordById);

module.exports = router;