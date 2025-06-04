const jwt = require('jsonwebtoken');

// Middleware per autenticazione
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Effettua il login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token non valido o scaduto.' });
  }
};

// Middleware per autorizzazione in base al ruolo
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Non hai i permessi per accedere a questa risorsa.' });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
