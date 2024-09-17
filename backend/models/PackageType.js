const mongoose = require('mongoose');

const packageTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  numberOfHeroes: { type: Number, required: true },
  guaranteedRare: { type: Number, default: 0 },
  guaranteedEpic: { type: Number, default: 0 },
  guaranteedLegendary: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('PackageType', packageTypeSchema);
