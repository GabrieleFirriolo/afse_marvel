const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageType: { type: mongoose.Schema.Types.ObjectId, ref: 'PackageType', required: true },
  heroes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hero', required: true }],
  opened: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);
