const { body } = require('express-validator');

module.exports = [
  body('oldPassword')
    .notEmpty().withMessage('La vecchia password è obbligatoria')
    .isLength({ min: 6 }).withMessage('La vecchia password deve contenere almeno 6 caratteri'),

  body('newPassword')
    .notEmpty().withMessage('La nuova password è obbligatoria')
    .isLength({ min: 6 }).withMessage('La nuova password deve contenere almeno 6 caratteri')
];
