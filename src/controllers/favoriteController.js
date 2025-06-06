const Favorite = require('../models/Favorite');
const Event = require('../models/Event');

exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Evento non trovato" });

    const favorite = new Favorite({ user: userId, event: eventId });
    await favorite.save();

    res.status(201).json({ message: "Evento aggiunto ai preferiti" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Evento già tra i preferiti" });
    }
    res.status(500).json({ message: "Errore nel salvataggio", error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const result = await Favorite.findOneAndDelete({ user: userId, event: eventId });
    if (!result) return res.status(404).json({ message: "Evento non era tra i preferiti" });

    res.json({ message: "Evento rimosso dai preferiti" });
  } catch (err) {
    res.status(500).json({ message: "Errore nella rimozione", error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await Favorite.find({ user: userId }).populate("event");
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Errore nel recupero", error: err.message });
  }
};
