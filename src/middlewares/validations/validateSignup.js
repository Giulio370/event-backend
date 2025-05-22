const { body } = require('express-validator');

const validateSignup = [
  body('email')
    .isEmail().withMessage('Email non valida')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La password deve contenere almeno 6 caratteri')
    .matches(/\d/).withMessage('La password deve contenere almeno un numero')
    .matches(/[A-Z]/).withMessage('La password deve contenere almeno una lettera maiuscola'),
];

module.exports = validateSignup;
