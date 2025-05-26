const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email obbligatoria'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password obbligatoria'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  profileImageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)?$/i.test(url);
      },
      message: 'URL immagine non valido',
    },
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastVerificationEmailSentAt: {
    type: Date
  },
  refreshToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }


});

// Hash password prima del salvataggio
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
