

module.exports = (err, req, res, next) => {
  if (err) {
    console.error('Errore multer:', err);
    return res.status(500).json({ error: err.message || 'Errore upload multer' });
  }
  next();
};
