const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// Rotta di signup
router.post('/signup', register);

module.exports = router;
