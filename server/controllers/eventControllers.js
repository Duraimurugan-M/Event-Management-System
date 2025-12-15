const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');

// Create a new event
const createEvent = async (req, res) => {
    try {
        // determine organizer: if admin provided organizer id, allow it; otherwise use authenticated user
        const payload = { ...req.body };
        if (req.user && req.user._id) {
            if (req.user.role === 'admin' && payload.organizer) {
                // admin can specify organizer id in payload
            } else {
                payload.organizer = req.user._id;
            }
        }
        const eventData = await Event.create(payload);
        res.status(201).json({ message: 'Event created successfully', event: eventData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email role');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await Registration.deleteMany({ eventId: event._id });
        res.json({ message: 'Event deleted successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};