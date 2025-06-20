const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dati non validi',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = handleValidationErrors;
