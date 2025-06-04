const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true }
  },
  category: { type: String }, 
  price: { type: Number, default: 0 }, 
  images: [String], 
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  maxParticipants: { type: Number, default: 100 },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
},{
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
