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

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo evento' });
    }

    const hasBookings = await Booking.exists({ event: event._id });

    if (hasBookings) {
      return res.status(403).json({
        error: 'Impossibile eliminare un evento con prenotazioni attive'
      });
    }

    await event.deleteOne();
    res.json({ message: 'Evento eliminato' });

  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
};



//ANNULLA EVENTO (quando l'evento ha prenotazioni non sarà più possibile eliminarlo, ma si potrà solo annullare)
exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questo evento' });

    if (event.status === 'draft') {
      return res.status(400).json({ error: 'Non puoi annullare un evento in bozza. Puoi solo eliminarlo.' });
    }

    if (event.status === 'canceled') {
      return res.status(400).json({ error: 'Evento già annullato.' });
    }

    event.status = 'canceled';
    await event.save();

    res.json({ message: 'Evento annullato con successo' });

  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'annullamento' });
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


//PATCH Elimina immagine EVENTO (Anche da Cloudinary)
const { cloudinary } = require('../utils/cloudinary');

exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const eventId = req.params.id;

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non sei autorizzato' });
    }

    const imageIndex = event.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Immagine non trovata nell\'evento' });
    }

    event.images.splice(imageIndex, 1);
    await event.save();

    // Rimuove da Cloudinary
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp|avif)/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      await cloudinary.uploader.destroy(`events/${publicId}`);
    }

    res.json({ message: 'Immagine rimossa con successo' });

  } catch (err) {
    console.error(' Errore rimozione immagine:', err);
    res.status(500).json({ error: 'Errore durante la rimozione' });
  }
};


// POST PRENOTA EVENTO
exports.bookEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
if (!event) return res.status(404).json({ error: 'Evento non trovato' });

// Doppia prenotazione
const existing = await Booking.findOne({ user: userId, event: eventId });
if (existing) return res.status(400).json({ error: 'Sei già prenotato a questo evento' });

// Limite massimo partecipanti raggiunto
const currentCount = await Booking.countDocuments({ event: eventId });
if (currentCount >= event.maxParticipants) {
  return res.status(400).json({ error: 'Posti esauriti per questo evento' });
}

const booking = new Booking({ user: userId, event: eventId });
await booking.save();

res.status(201).json({ message: 'Prenotazione effettuata con successo' });


    res.status(201).json({ message: 'Prenotazione effettuata con successo' });
  } catch (err) {
    console.error(' Errore prenotazione:', err);
    res.status(500).json({ error: 'Errore durante la prenotazione' });
  }
};

// ANNULLA PRENOTAZIONE
exports.cancelBooking = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    const deleted = await Booking.findOneAndDelete({ user: userId, event: eventId });
    if (!deleted) return res.status(404).json({ error: 'Prenotazione non trovata' });

    res.json({ message: 'Prenotazione annullata con successo' });
  } catch (err) {
    console.error(' Errore annullamento:', err);
    res.status(500).json({ error: 'Errore durante la cancellazione' });
  }
};

// GET Lista eventi prenotati dall’utente
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId }).populate({
      path: 'event',
      select: 'title date location category status'
    });

    res.json(bookings.map(b => ({
      eventId: b.event._id,
      title: b.event.title,
      date: b.event.date,
      city: b.event.location.city,
      address: b.event.location.address,
      category: b.event.category,
      status: b.event.status,
      bookingDate: b.createdAt
    })));
  } catch (err) {
    console.error(' Errore getMyBookings:', err);
    res.status(500).json({ error: 'Errore nel recupero delle prenotazioni utente' });
  }
};

//GET Dashboard Organizzatore
exports.getDashboardStats = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const events = await Event.find({ organizer: organizerId });

    let totalBookings = 0;
    let totalOccupancy = 0;

    let published = 0, draft = 0, canceled = 0;

    for (const event of events) {
      const bookingCount = await Booking.countDocuments({ event: event._id });
      totalBookings += bookingCount;

      if (event.status === 'published') published++;
      if (event.status === 'draft') draft++;
      if (event.status === 'canceled') canceled++;

      if (event.maxParticipants > 0) {
        totalOccupancy += (bookingCount / event.maxParticipants) * 100;
      }
    }

    const response = {
      totalEvents: events.length,
      publishedEvents: published,
      draftEvents: draft,
      canceledEvents: canceled,
      totalBookings,
      averageOccupancy: events.length > 0 ? Math.round(totalOccupancy / events.length) : 0
    };

    res.json(response);

  } catch (err) {
    console.error('Errore dashboard organizer:', err);
    res.status(500).json({ error: 'Errore nel recupero dashboard organizer' });
  }
};

//Aggiungi l'immagine di copertina
exports.uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file ricevuto' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questo evento' });
    }

    // Salva la cover image come path Cloudinary
    event.coverImage = req.file.path;
    await event.save();

    res.json({
      message: 'Copertina caricata con successo',
      coverImage: event.coverImage
    });

  } catch (err) {
    console.error('Errore upload copertina:', err);
    res.status(500).json({ error: 'Errore durante l\'upload della copertina' });
  }
};





//GET LISTA PARTECIPANTI
exports.getBookings = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Evento non trovato' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const bookings = await Booking.find({ event: eventId }).populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    console.error(' Errore nel recupero prenotazioni:', err);
    res.status(500).json({ error: 'Errore durante il recupero' });
  }
};

//GET MY EVENTS (ORGANIZER)

exports.getMyEvents = async (req, res) => {
  try {

    const organizerId = req.user?.id || req.user?._id;
    if (!organizerId) {
      return res.status(400).json({ error: 'Organizer ID non trovato nel token' });
    }

    const events = await Event.find({ organizer: organizerId })
  .select('title date location status')  
  .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore nel recupero evento' });
  }
};






