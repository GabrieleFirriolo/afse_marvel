const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  proposer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposedHeroes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hero' }], // Array per supportare più eroi proposti
  requestedHeroes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hero' }], // Array per supportare più eroi richiesti
  proposedCredits: { type: Number, default: 0 }, // Per la vendita di figurine per crediti
  requestedCredits: { type: Number, default: 0 }, // Per la vendita di figurine per crediti
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  name: { type: String },
  acceptor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trade', tradeSchema);
