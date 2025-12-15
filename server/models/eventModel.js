const mongoose = require('mongoose');  
const EventSchema = new mongoose.Schema({  
  title: {  
    type: String,
    required: [true, 'Title is required'],  
  },  
  description: {
    type: String,
    required: [true, 'Description is required'],  
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    },
    date: {
    type: Date,
    required: [true, 'Date is required'],
    },
    location: {
    type: String,
    required: [true, 'Location is required'],
    },
    capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    },
    organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required'],
    },
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;