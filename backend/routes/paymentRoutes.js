const express = require('express');
const { authenticateToken, requirePatient } = require('../middleware/auth');
const { initiatePayment, verifyPayment } = require('../controller/paymentController');

const router = express.Router();

router.post('/initiate', authenticateToken, requirePatient, initiatePayment);
router.get('/verify', verifyPayment); // no auth — called via redirect

module.exports = router;
