const mongoose = require('mongoose');

const heroItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  linkUrl: { type: String, default: '/' },
  buttonText: { type: String, default: 'Shop Now' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HeroItem', heroItemSchema);
