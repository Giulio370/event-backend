const { body } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email non valida'),
  body('password')
    .notEmpty().withMessage('La password è obbligatoria'),
];

module.exports = validateLogin;
