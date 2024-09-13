const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const albumEntrySchema = new mongoose.Schema({
  hero: { type: mongoose.Schema.Types.ObjectId, ref: 'Hero', required: true },
  count: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favoriteHero: { type: mongoose.Schema.Types.ObjectId, ref: 'Hero', required: true },
  credits: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  album: [albumEntrySchema],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook per crittografare la password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo per confrontare la password inserita con quella crittografata
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
