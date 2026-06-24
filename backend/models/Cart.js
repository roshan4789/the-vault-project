const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // "anonymous" for now, scalable later
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    addedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Cart', cartSchema);
