const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const validateEvent = require('../middlewares/validations/validateEvent');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/upload');



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




module.exports = router;
