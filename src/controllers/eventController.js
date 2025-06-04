const Event = require('../models/Event');
const Booking = require('../models/Booking');

// POST Crea Evento
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, price, maxParticipants } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      price,
      maxParticipants,
      organizer: req.user.id
    });

    await event.save();
    res.status(201).json({ message: 'Evento creato con successo', event });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la creazione dell\'evento' });
  }
};

// PATCH Modifica Evento
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questo evento' });

    Object.assign(event, req.body);
    await event.save();
    res.json({ message: 'Evento aggiornato', event });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
  }
};

// DELETE Elimina Evento
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo evento' });

    await event.deleteOne();
    res.json({ message: 'Evento eliminato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
};

// Pubblica evento
exports.publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: 'Non sei autorizzato a pubblicare questo evento' });

    event.status = 'published';
    await event.save();
    res.json({ message: 'Evento pubblicato', event });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la pubblicazione' });
  }
};

// GET eventi pubblici (FILTRI)
exports.getEvents = async (req, res) => {
  try {
    const { city, category, dateFrom, dateTo, priceMax } = req.query;
    const filter = { status: 'published' };

    if (city) filter['location.city'] = city;
    if (category) filter.category = category;
    if (priceMax) filter.price = { $lte: priceMax };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero eventi' });
  }
};

// GET evento per ID (visibile solo se pubblicato o l'organizer è l'utente)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.status !== 'published' && event.organizer.toString() !== req.user?.id)
      return res.status(403).json({ error: 'Non sei autorizzato a vedere questo evento' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero evento' });
  }
};

//PATCH Carica immagine EVENTO
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file ricevuto' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento non trovato' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }


    event.images.push(req.file.path);
    await event.save();

    res.json({ message: 'Immagine caricata', imageUrl: req.file.path });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore upload immagine' });
  }
};




