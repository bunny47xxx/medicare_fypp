const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getAllUsers, 
  getAllDoctors, 
  getAllAppointments,
  updateUserStatus,
  getDashboardStats,
  getPendingVerifications,
  reviewVerification,
} = require('../controller/adminController');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);

// User management
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:id/status', authenticateToken, requireAdmin, updateUserStatus);

// Doctor management
router.get('/doctors', authenticateToken, requireAdmin, getAllDoctors);

// Appointment management
router.get('/appointments', authenticateToken, requireAdmin, getAllAppointments);

// Doctor verification
router.get('/verifications', authenticateToken, requireAdmin, getPendingVerifications);
router.put('/verifications/:doctorId/review', authenticateToken, requireAdmin, reviewVerification);

module.exports = router;