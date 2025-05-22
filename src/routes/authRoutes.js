const express = require('express');
const router = express.Router();

const {
  register,
  verifyEmail,
  resendVerificationEmail
} = require('../controllers/authController');

const validateSignup = require('../middlewares/validations/validateSignup');
const handleValidationErrors = require('../middlewares/validations/handleValidationErrors');

router.post('/signup', validateSignup, handleValidationErrors, register);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
