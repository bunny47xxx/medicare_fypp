const express = require('express');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const {
  getDoctorProfile,
  updateDoctorProfile,
  submitVerificationRequest,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorAppointments,
  updateAppointmentStatus,
  addAppointmentNote,
  getDoctorAvailability,
  setDoctorAvailability,
  deleteDoctorAvailability,
  createMedicalRecord,
  getDoctorMedicalRecords,
  getDoctorEarnings,
  notifyVideoCall,
} = require('../controller/doctorController');

const router = express.Router();

// Doctor profile & credentials
router.get('/profile', authenticateToken, requireDoctor, getDoctorProfile);
router.put('/profile', authenticateToken, requireDoctor, updateDoctorProfile);
router.post('/profile/verify', authenticateToken, requireDoctor, submitVerificationRequest);

// Doctor schedule (recurring weekly)
router.get('/schedule', authenticateToken, requireDoctor, getDoctorSchedule);
router.post('/schedule', authenticateToken, requireDoctor, updateDoctorSchedule);

// Doctor availability (date-specific)
router.get('/availability', authenticateToken, requireDoctor, getDoctorAvailability);
router.post('/availability', authenticateToken, requireDoctor, setDoctorAvailability);
router.delete('/availability/:id', authenticateToken, requireDoctor, deleteDoctorAvailability);

// Doctor appointments
router.get('/appointments', authenticateToken, requireDoctor, getDoctorAppointments);
router.put('/appointments/:id/status', authenticateToken, requireDoctor, updateAppointmentStatus);
router.post('/appointments/:id/note', authenticateToken, requireDoctor, addAppointmentNote);

// Medical records
router.post('/medical-records', authenticateToken, requireDoctor, createMedicalRecord);
router.get('/medical-records', authenticateToken, requireDoctor, getDoctorMedicalRecords);

// Earnings
router.get('/earnings', authenticateToken, requireDoctor, getDoctorEarnings);

// Video call notification
router.post('/appointments/notify-call', authenticateToken, requireDoctor, notifyVideoCall);

module.exports = router;