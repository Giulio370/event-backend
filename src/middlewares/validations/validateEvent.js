const { body } = require('express-validator');
const handleValidationErrors = require('./handleValidationErrors');

const validateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Il titolo è obbligatorio'),

  body('date')
    .isISO8601()
    .withMessage('Data non valida'),

  body('location.city')
    .notEmpty()
    .withMessage('La città è obbligatoria'),

  body('location.address')
    .notEmpty()
    .withMessage('L\'indirizzo è obbligatorio'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Prezzo non valido'),

  body('maxParticipants')
    .isInt({ min: 1 })
    .withMessage('Numero partecipanti non valido'),

  handleValidationErrors
];

module.exports = validateEvent;
