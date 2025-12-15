const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],  
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'attended'],
    default: 'registered',
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;