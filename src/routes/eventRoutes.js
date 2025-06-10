const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const validateEvent = require('../middlewares/validations/validateEvent');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/upload');

//Lista Eventi Prenotati
router.get(
  '/me/bookings',
  authenticateJWT,
  authorizeRoles('user'), 
  eventController.getMyBookings
);

router.get('/me', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `Bentornato ${req.user.email}`,
    user: req.user
  });
});

// Crea evento (solo organizer)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('organizer'),
  validateEvent,
  eventController.createEvent
);

// Modifica evento (solo organizer)
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('organizer'),
  validateEvent,
  eventController.updateEvent
);

// Elimina evento (solo organizer)
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('organizer'),
  eventController.deleteEvent
);

// Pubblica evento
router.patch(
  '/:id/publish',
  authenticateJWT,
  authorizeRoles('organizer'),
  eventController.publishEvent
);

// GET eventi 
router.get('/', eventController.getEvents);



//GET my EVENTS (Organizer)
router.get(
  '/my-events',
  authenticateJWT,
  authorizeRoles('organizer'),
  eventController.getMyEvents
);



// GET dettaglio evento per ID
router.get('/:id', authenticateJWT, eventController.getEventById);

//POST Carica Immagine Evento
router.patch(
  '/:id/images',
  authenticateJWT,
  authorizeRoles('organizer'),
  upload.single('image'),
  require('../middlewares/multerErrorHandler'),
  eventController.uploadImage
);


//PATCH Elimina immagine EVENTO (Anche da Cloudinary)
router.delete(
  '/:id/images',
  authenticateJWT,
  authorizeRoles('organizer'),
  eventController.removeImage
);


// Prenota evento
router.post(
  '/:id/book',
  authenticateJWT,
  authorizeRoles('user'),
  eventController.bookEvent
);

// Annulla prenotazione
router.delete(
  '/:id/book',
  authenticateJWT,
  authorizeRoles('user'),
  eventController.cancelBooking
);

// Lista prenotazioni evento (solo organizer)
router.get(
  '/:id/bookings',
  authenticateJWT,
  authorizeRoles('organizer'),
  eventController.getBookings
);



//Annulla evento
router.patch("/:id/cancel", authenticateJWT, authorizeRoles("organizer"), eventController.cancelEvent);






module.exports = router;
