// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, requestPasswordReset, resetPassword } = require('./../controller/userController.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
