const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');

// Register a user for an event
const registerForEvent = async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        if (!eventId || !userId) {
            return res.status(400).json({ message: 'Event ID and User ID are required' });
        }  
        // Check if the event exists and capacity
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Count current registered users (only 'registered' status)
        const currentCount = await Registration.countDocuments({ eventId, status: 'registered' });
        if (typeof event.capacity === 'number' && currentCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Check if the user is already registered for the event
        const existingRegistration = await Registration.findOne({ eventId, userId });
        if (existingRegistration) {
            return res.status(400).json({ message: 'User is already registered for this event' });
        }

        // Create a new registration
        const registration = await Registration.create({ eventId, userId, status: 'registered' });

        res.status(201).json({ message: 'User registered for the event successfully', registration, registeredCount: currentCount + 1 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get registrations for a specific event
const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

        // only organizer should view registrations
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        const requesterId = req.user && req.user._id ? String(req.user._id) : null;
        const organizerId = event && event.organizer ? String(event.organizer) : null;
        if (requesterId !== organizerId) return res.status(403).json({ message: 'Only organizer can view registrations' });

        const regs = await Registration.find({ eventId }).populate('userId', 'name email role');
        res.status(200).json({ eventId, registeredUsers: regs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyEventRegistrations = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const registrations = await Registration.find({ userId }).populate('eventId');
        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllRegisteredEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name email role');

        // For every event, fetch all registrations and their users
        const results = await Promise.all(
            events.map(async (event) => {
                const regs = await Registration.find({ eventId: event._id })
                    .populate('userId', 'name email role');

                return {
                    event,
                    registeredUsers: regs
                };
            })
        );

        res.json(results);

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const cancelRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;
        if (!registrationId) {
            return res.status(400).json({ message: 'Registration ID is required' });
        }
        const registration = await Registration.findById(registrationId);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // allow if requester is the registrant or the event organizer
        const event = await Event.findById(registration.eventId);
        const requesterId = req.user && req.user._id ? String(req.user._id) : null;
        const registrantId = String(registration.userId);
        const organizerId = event && event.organizer ? String(event.organizer) : null;

        if (requesterId !== registrantId && requesterId !== organizerId) {
            return res.status(403).json({ message: 'Not allowed to cancel this registration' });
        }

        registration.status = 'cancelled';
        await registration.save();
        res.status(200).json({ message: 'Registration cancelled successfully', registration });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const attendedEvent = async (req, res) => {
    try {
        const { registrationId } = req.params;
        if (!registrationId) {
            return res.status(400).json({ message: 'Registration ID is required' });
        }
        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        // allow if requester is the registrant or the event organizer
        const event = await Event.findById(registration.eventId);
        const requesterId = req.user && req.user._id ? String(req.user._id) : null;
        const registrantId = String(registration.userId);
        const organizerId = event && event.organizer ? String(event.organizer) : null;
        if (requesterId !== registrantId && requesterId !== organizerId) {
            return res.status(403).json({ message: 'Not allowed to mark attendance for this registration' });
        }

        registration.status = 'attended';
        await registration.save();
        const populatedEvent = await Event.findById(registration.eventId).populate('organizer', 'name email role');
        res.status(200).json({ message: 'Event marked as attended successfully', event: populatedEvent, registration });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Organizer: delete a registration record (remove user)
const deleteRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;
        if (!registrationId) return res.status(400).json({ message: 'Registration ID is required' });
        const registration = await Registration.findById(registrationId);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        const event = await Event.findById(registration.eventId);
        const requesterId = req.user && req.user._id ? String(req.user._id) : null;
        const organizerId = event && event.organizer ? String(event.organizer) : null;
        if (requesterId !== organizerId) return res.status(403).json({ message: 'Only organizer can remove registrations' });
        await Registration.findByIdAndDelete(registrationId);
        res.status(200).json({ message: 'Registration removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Organizer: remove all registrations for an event
const deleteAllRegistrationsForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        const requesterId = req.user && req.user._id ? String(req.user._id) : null;
        const organizerId = event && event.organizer ? String(event.organizer) : null;
        if (requesterId !== organizerId) return res.status(403).json({ message: 'Only organizer can remove all registrations' });
        await Registration.deleteMany({ eventId });
        res.status(200).json({ message: 'All registrations removed for event' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerForEvent,
    getMyEventRegistrations,
    cancelRegistration,
    getAllRegisteredEvents,
    getEventRegistrations,
    attendedEvent,
    deleteRegistration,
    deleteAllRegistrationsForEvent
};