const express = require('express');
const router = express.Router();
const {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  refreshToken
} = require('../controllers/authController');

const validateLogin = require('../middlewares/validations/validateLogin');
const validateSignup = require('../middlewares/validations/validateSignup');
const handleValidationErrors = require('../middlewares/validations/handleValidationErrors');
const { logout } = require('../controllers/authController');

router.post('/logout', logout);
router.post('/signup', validateSignup, handleValidationErrors, register);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/refresh-token', refreshToken);
router.post('/login', validateLogin, handleValidationErrors, login);

module.exports = router;
