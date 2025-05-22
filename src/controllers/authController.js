const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/mailer');

// POST /signup
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const exists = await User.findOne({ email });

    if (exists) {
      if (!exists.verified) {
        return res.status(400).json({
          message: 'Email già registrata ma non verificata. Controlla la tua casella email per completare la verifica.'
        });
      }
      return res.status(400).json({ message: 'Email già registrata.' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: process.env.EMAIL_TOKEN_EXPIRATION || '15m' }
    );

    await sendVerificationEmail(user.email, token);
    res.status(201).json({ message: 'Registrazione completata.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore server.' });
  }
};

// GET /verify
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token mancante.' });
  }

  try {
    const payload = jwt.verify(token, process.env.EMAIL_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) return res.status(404).json({ message: 'Utente non trovato.' });
    if (user.verified) {
      return res.status(200).json({ message: 'Email già verificata.' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verificata con successo.' });
  } catch (err) {
    console.error('Errore verifica token:', err.message);
    res.status(400).json({ message: 'Token non valido o scaduto.' });
  }
};

// POST /resend-verification
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utente non trovato.' });

    if (user.verified) {
      return res.status(400).json({ message: 'Email già verificata.' });
    }

    const now = new Date();
    const lastSent = user.lastVerificationEmailSentAt;
    const resendInterval = parseInt(process.env.RESEND_VERIFICATION_INTERVAL, 10);

    if (lastSent && now - lastSent < resendInterval) {
      const secondsLeft = Math.ceil((resendInterval - (now - lastSent)) / 1000);
      return res.status(429).json({ message: `Attendi almeno ${secondsLeft} secondi prima di richiedere un nuovo link.` });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: process.env.EMAIL_TOKEN_EXPIRATION || '15m' }
    );

    await sendVerificationEmail(user.email, token);

    user.lastVerificationEmailSentAt = now;
    await user.save();

    res.status(200).json({ message: 'Email di verifica inviata nuovamente.' });
  } catch (err) {
    console.error('Errore nel reinvio email:', err.message);
    res.status(500).json({ message: 'Errore del server.' });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail
};
