const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventControllers');
const { protect } = require('../middleware/authMiddleware');

// set up routes for event management
// Create event (protected)
router.post('/', protect, createEvent);
router.get('/', protect, getAllEvents);
router.get('/:id', protect, getEventById);
// Update / delete require authentication
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;