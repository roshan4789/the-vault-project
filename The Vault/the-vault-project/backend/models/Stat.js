const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  visits: { type: Number, default: 0 },
  sales: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stat', statSchema);
