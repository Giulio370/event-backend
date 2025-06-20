const express = require('express');
const router = express.Router();
const {
  updateMe,
  getMe,
  changePassword,
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');


const validateLogin = require('../middlewares/validations/validateLogin');
const validateSignup = require('../middlewares/validations/validateSignup');
const handleValidationErrors = require('../middlewares/validations/handleValidationErrors');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const validateUpdateUser = require('../middlewares/validations/validateUpdateUser');
const validateChangePassword = require('../middlewares/validations/validateChangePassword');

router.get('/me', authenticateJWT, getMe);
router.patch('/me', authenticateJWT, validateUpdateUser, handleValidationErrors, updateMe);

router.patch('/me/password',  authenticateJWT,  validateChangePassword,  handleValidationErrors,  changePassword);
router.post('/logout', logout);
router.post('/signup', validateSignup, handleValidationErrors, register);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/refresh-token', refreshToken);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;
