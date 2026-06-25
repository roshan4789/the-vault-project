const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: String, required: true }, // Using string ID to match existing Product.id references
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
