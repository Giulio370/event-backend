const User = require('../models/User');

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Controlla se l'utente esiste già
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'Registrazione completata.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore server.' });
  }
};

module.exports = { register };
