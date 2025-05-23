const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/mailer');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/jwt');
const { verifyToken } = require('../utils/jwt');


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


//POST /LogIn
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cerca l'utente
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Verifica la password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // Verifica se l'utente ha confermato l'email
    if (!user.verified) {
      return res.status(403).json({ message: 'Conferma prima la tua email' });
    }

    // Genera i token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Salva il refresh token nel DB
    user.refreshToken = refreshToken;
    await user.save();

    // Imposta i cookie HTTP-only
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 minuti
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni
    });

    // Risposta con info utente
    res.status(200).json({
      message: 'Login effettuato con successo',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore del server' });
  }
};


//POST /logout

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // Cancella i cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout effettuato con successo' });
  } catch (err) {
    console.error('Errore nel logout:', err);
    res.status(500).json({ message: 'Errore durante il logout' });
  }
};


//POST /refreshToken
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Token di refresh mancante' });
    }

    // Verifica il refresh token
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

    if (!decoded.id) {
      return res.status(403).json({ message: 'Token non valido' });
    }

    // Cerca l'utente
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: 'Utente non trovato' });
    }


    if (user.refreshToken !== token) {
      return res.status(403).json({ message: 'Token di refresh non valido' });
    }


    // Genera nuovi token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Salva il nuovo refresh token nel DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Invia nuovi cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 minuti
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni
    });

    res.status(200).json({
      message: 'Token aggiornato',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Errore nel refresh token:', err);
    res.status(403).json({ message: 'Token di refresh non valido o scaduto' });
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
  logout,
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  refreshToken
};
