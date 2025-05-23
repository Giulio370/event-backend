const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.get('/me', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `Bentornato ${req.user.email}`,
    user: req.user
  });
});

module.exports = router;
