const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: false
    },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },

  category: { type: String },
  price: { type: Number, default: 0 },

  coverImage: { type: String }, 
  images: [String],            

  status: {
    type: String,
    enum: ['draft', 'published', 'canceled'],
    default: 'draft'
  },

  maxParticipants: { type: Number, default: 100 },

  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
