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

// Serve la pagina HTML per il reset password da link email
router.get('/reset-password-form', (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).send('Link non valido o incompleto.');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reimposta password</title>
    </head>
    <body style="font-family: sans-serif; max-width: 400px; margin: 40px auto;">
      <h2> Reimposta la tua password</h2>
      <form id="resetForm">
        <input type="hidden" name="token" value="${token}" />
        <input type="hidden" name="email" value="${email}" />
        <label>Nuova Password:</label><br/>
        <input type="password" name="newPassword" required /><br/><br/>
        <button type="submit">Salva nuova password</button>
      </form>
      <p id="result" style="margin-top: 20px;"></p>
      <script>
        const form = document.getElementById('resetForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const token = formData.get('token');
          const email = formData.get('email');
          const newPassword = formData.get('newPassword');

          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email, newPassword })
          });

          const resultText = document.getElementById('result');
          if (res.ok) {
            resultText.textContent = ' Password aggiornata con successo!';
            resultText.style.color = 'green';
          } else {
            resultText.textContent = ' Errore: token scaduto o password non valida.';
            resultText.style.color = 'red';
          }
        });
      </script>
    </body>
    </html>
  `);
});



module.exports = router;
