require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Connected to MongoDB Successfully");

    const tempProducts = [
      { id: 'prod-1', name: "Cyber-Katana Replica (Neon Blue)", price: 149.99, category: "Replicas", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1589315421526-0e107df0e0bd?auto=format&fit=crop&q=80&w=400", badge: "New" },
      { id: 'prod-2', name: "Evangelion Unit-01 Action Figure", price: 89.99, category: "Figures", rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1596726202484-98c9f564dc5c?auto=format&fit=crop&q=80&w=400", badge: "Best Seller" },
      { id: 'prod-3', name: "Holographic Cyber Jacket", price: 120.00, category: "Apparel", rating: 4.5, reviews: 56, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400", badge: "Limited" },
      { id: 'prod-4', name: "Akira Neo-Tokyo Synthwave Poster", price: 24.99, category: "Posters", rating: 5.0, reviews: 210, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400", badge: null },
      { id: 'prod-5', name: "Quantum Core LED Desk Lamp", price: 59.99, category: "Accessories", rating: 4.7, reviews: 42, image: "https://images.unsplash.com/photo-1517685633466-403d6955aeab?auto=format&fit=crop&q=80&w=400", badge: "Hot" },
      { id: 'prod-6', name: "Darth Vader 1:1 Scale Helmet", price: 299.99, category: "Replicas", rating: 4.9, reviews: 312, image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=400", badge: "Premium" },
    ];
    
    await Product.insertMany(tempProducts);
    console.log("Added temporary products successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};
connectDB();
