const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Using string id to preserve existing initialCatalog IDs
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  images: [{ type: String, required: true }],
  badge: { type: String, default: null }
});

module.exports = mongoose.model('Product', productSchema);
