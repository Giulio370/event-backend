const { body } = require('express-validator');

const validateUpdateUser = [
  body('email')
    .optional()
    .isEmail().withMessage('Email non valida'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password troppo corta')
    .matches(/[A-Z]/).withMessage('Serve almeno una maiuscola')
    .matches(/\d/).withMessage('Serve almeno un numero'),
];

module.exports = validateUpdateUser;
