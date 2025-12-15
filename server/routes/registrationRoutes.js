const express = require('express');
const router = express.Router();
const { registerForEvent, getMyEventRegistrations, getAllRegisteredEvents, cancelRegistration, attendedEvent, getEventRegistrations, deleteRegistration, deleteAllRegistrationsForEvent } = require('../controllers/registrationControllers');
const { protect } = require('../middleware/authMiddleware');

// Registration route for events (protected)
router.post('/register', protect, registerForEvent);
// User's own registrations (protected) - controller can verify req.params.userId matches req.user._id if needed
router.get('/user/:userId/registrations', protect, getMyEventRegistrations);
// All registered events (protected)
router.get('/all-registered-events', protect, getAllRegisteredEvents);
// Registrations for a specific event (protected)
router.get('/event/:eventId/registrations', protect, getEventRegistrations);
// Cancel registration (protected)
router.put('/registration/:registrationId/cancel', protect, cancelRegistration);
// Mark attended (protected)
router.put('/registration/:registrationId/attend', protect, attendedEvent);

// Organizer: delete a registration
router.delete('/registration/:registrationId', protect, deleteRegistration);
// Organizer: delete all registrations for an event
router.delete('/event/:eventId/registrations', protect, deleteAllRegistrationsForEvent);

module.exports = router;