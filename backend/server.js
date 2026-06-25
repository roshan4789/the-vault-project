require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Stat = require('./models/Stat');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ---------------------------------------------------------
// DATABASE CONNECTION & SEEDING
// ---------------------------------------------------------
let isDbConnected = false;
let offlineProducts = [
  { id: 'prod-1', name: "Cyber-Katana Replica (Neon Blue)", price: 149.99, category: "Replicas", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1589315421526-0e107df0e0bd?auto=format&fit=crop&q=80&w=400", badge: "New" },
  { id: 'prod-2', name: "Evangelion Unit-01 Action Figure", price: 89.99, category: "Figures", rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1596726202484-98c9f564dc5c?auto=format&fit=crop&q=80&w=400", badge: "Best Seller" },
  { id: 'prod-3', name: "Holographic Cyber Jacket", price: 120.00, category: "Apparel", rating: 4.5, reviews: 56, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400", badge: "Limited" },
  { id: 'prod-4', name: "Akira Neo-Tokyo Synthwave Poster", price: 24.99, category: "Posters", rating: 5.0, reviews: 210, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400", badge: null },
  { id: 'prod-5', name: "Quantum Core LED Desk Lamp", price: 59.99, category: "Accessories", rating: 4.7, reviews: 42, image: "https://images.unsplash.com/photo-1517685633466-403d6955aeab?auto=format&fit=crop&q=80&w=400", badge: "Hot" },
  { id: 'prod-6', name: "Darth Vader 1:1 Scale Helmet", price: 299.99, category: "Replicas", rating: 4.9, reviews: 312, image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=400", badge: "Premium" },
];

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MONGO_URI is missing from .env! Running in 'Offline API' Mode. No data will be saved.");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isDbConnected = true;
    console.log("🟢 Connected to MongoDB Successfully");

    // Auto-seed Initial Products if DB is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("Seeding Database with Initial Catalog...");
      const initialCatalog = [
        { id: '1', name: "Wado Ichimonji Katana - Hand Forged Replica", price: 149.99, category: "Replicas", rating: 4.9, reviews: 128, image: "https://images.unsplash.com/photo-1589255627727-4cb294ba452a?auto=format&fit=crop&q=80&w=400", badge: "Bestseller" },
        { id: '2', name: "Satoru Domain Expansion 1/7 Scale Figure", price: 89.99, category: "Figures", rating: 4.8, reviews: 56, image: "https://images.unsplash.com/photo-1606663886619-25ea15dd3f32?auto=format&fit=crop&q=80&w=400", badge: "Low Stock" },
        { id: '3', name: "Crimson Cloud Embroidered Heavy Hoodie", price: 59.99, category: "Apparel", rating: 4.7, reviews: 342, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400", badge: null },
        { id: '4', name: "Mark 85 Diecast 1/6 Scale Collectible Figure", price: 349.99, category: "Figures", rating: 5.0, reviews: 89, image: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&q=80&w=400", badge: "Pre-order" },
        { id: '5', name: "Vintage Web-Slinger Canvas Wall Art (24x36)", price: 24.99, category: "Posters", rating: 4.5, reviews: 210, image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400", badge: null },
        { id: '6', name: "Vibranium Shield 1:1 Prop Replica", price: 199.99, category: "Replicas", rating: 4.9, reviews: 45, image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&q=80&w=400", badge: "Hot" },
        { id: '7', name: "Hero's Master Sword - Full Tang Metal Prop", price: 129.99, category: "Replicas", rating: 4.9, reviews: 312, image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400", badge: "Exclusive" },
        { id: '8', name: "Neon City Extended RGB Gaming Desk Mat", price: 34.99, category: "Accessories", rating: 4.6, reviews: 87, image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=400", badge: null },
        { id: '9', name: "Leviathan Axe Frost Edition Replica", price: 159.99, category: "Replicas", rating: 4.8, reviews: 67, image: "https://images.unsplash.com/photo-1588724591460-6c9b3a016625?auto=format&fit=crop&q=80&w=400", badge: null },
        { id: '10', name: "Uchiha Clan Minimalist T-Shirt", price: 29.99, category: "Apparel", rating: 4.4, reviews: 15, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400", badge: null },
      ];
      await Product.insertMany(initialCatalog);
      console.log("Database seeded successfully!");
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};
connectDB();

// ---------------------------------------------------------
// MIDDLEWARE: VERIFY ADMIN
// ---------------------------------------------------------
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Access denied' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ---------------------------------------------------------
// USER AUTH ROUTES
// ---------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id, name: user.name, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const { email, password } = req.body;
    
    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, name: user.name, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// PUBLIC STOREFRONT ROUTES
// ---------------------------------------------------------

app.get('/', (req, res) => {
  res.send('The Vault Backend API is Running');
});

app.get('/api/products', async (req, res) => {
  if (!process.env.MONGO_URI) {
    console.log("Serving offline mock products...");
    return res.json(offlineProducts);
  }
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get('/api/stats', async (req, res) => {
  if (!process.env.MONGO_URI) {
    // Offline Mock Stats
    return res.json({
      activeUsers: 0, // Reset to start at 0
      artifactsSecured: 6,
      itemsShipped: 0 // Realistic default when offline
    });
  }

  try {
    // Increment active users / visits
    let globalStats = await Stat.findOne({ id: 'global_stats' });
    if (!globalStats) {
      globalStats = new Stat({ id: 'global_stats', visits: 0 });
    }
    
    globalStats.visits += 1;
    await globalStats.save();

    // Count actual database artifacts
    const productCount = await Product.countDocuments();

    res.json({
      activeUsers: globalStats.visits,
      artifactsSecured: productCount,
      itemsShipped: globalStats.sales || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get('/api/cart', async (req, res) => {
  if (!process.env.MONGO_URI) return res.json([]);
  try {
    const cart = await Cart.findOne({ userId: 'anonymous' });
    res.json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.post('/api/cart', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    let cart = await Cart.findOne({ userId: 'anonymous' });
    if (!cart) cart = new Cart({ userId: 'anonymous', items: [] });
    cart.items.push({
      productId: req.body.id,
      name: req.body.name,
      price: req.body.offerPrice || req.body.price,
      image: req.body.image
    });
    await cart.save();
    res.status(201).json(cart.items[cart.items.length - 1]);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const cart = await Cart.findOne({ userId: 'anonymous' });
    if (cart) {
      cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
      await cart.save();
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Checkout Route (Create Order)
app.post('/api/orders', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const cart = await Cart.findOne({ userId: 'anonymous' });
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    const order = new Order({
      userId: 'anonymous', // Simulated user
      items: cart.items,
      totalAmount: totalAmount + (totalAmount > 50 ? 0 : 15) // Adding shipping if applicable
    });
    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!genAI) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    let catalogDesc = "No products found.";
    if (process.env.MONGO_URI) {
      const products = await Product.find({}).select('name price category rating badge -_id');
      catalogDesc = JSON.stringify(products);
    }
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are the AI Customer Support bot for "The Vault". Your job is to help users troubleshoot issues, report problems, and answer questions about orders or products. Always be polite and helpful. If a user asks to speak to a human, needs further assistance, or has a complex issue, provide them with our official support email: support@thevault.com. For reference, here is the current store catalog: ${catalogDesc}. Keep replies under 3 short paragraphs.`
    });
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "AI error." });
  }
});

// ---------------------------------------------------------
// PROTECTED ADMIN ROUTES & STATE
// ---------------------------------------------------------
let offlineOrders = [
  { 
    _id: "mock-order-001", 
    createdAt: new Date().toISOString(), 
    status: "Processing", 
    items: [ { name: "Neon Katana", price: 149.99 } ], 
    totalAmount: 149.99 
  }
];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes." }
});

// Admin Login
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  
  if (
    username === process.env.ADMIN_USER && 
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, success: true });
  }
  
  res.status(401).json({ error: "Invalid credentials" });
});

// Admin Get Orders
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
  try {
    if (!process.env.MONGO_URI) {
      return res.json(offlineOrders);
    }
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin Mark Order Delivered
app.put('/api/admin/orders/:id/deliver', verifyAdmin, async (req, res) => {
  try {
    if (!process.env.MONGO_URI) {
      const order = offlineOrders.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.status === 'Delivered') return res.status(400).json({ error: "Order is already marked as Delivered" });
      order.status = 'Delivered';
      return res.json({ success: true, order });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    if (order.status === 'Delivered') {
      return res.status(400).json({ error: "Order is already marked as Delivered" });
    }

    order.status = 'Delivered';
    await order.save();

    // Increment Items Shipped / Delivered Stat globally
    let globalStats = await Stat.findOne({ id: 'global_stats' });
    if (!globalStats) {
      globalStats = new Stat({ id: 'global_stats', visits: 0, sales: 0 });
    }
    globalStats.sales = (globalStats.sales || 0) + order.items.length;
    await globalStats.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Admin Create Product
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
  try {
    const productData = req.body;
    productData.id = Date.now().toString(); // Generate ID mapping
    
    if (!process.env.MONGO_URI) {
      offlineProducts.unshift(productData);
      return res.status(201).json(productData);
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: "Failed to create product" });
  }
});

// Admin Update Product
app.put('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    if (!process.env.MONGO_URI) {
      const index = offlineProducts.findIndex(p => p.id === req.params.id);
      if (index !== -1) {
        offlineProducts[index] = { ...offlineProducts[index], ...req.body, id: req.params.id };
        return res.json(offlineProducts[index]);
      }
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// Admin Delete Product
app.delete('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    if (!process.env.MONGO_URI) {
      offlineProducts = offlineProducts.filter(p => p.id !== req.params.id);
      return res.json({ success: true });
    }

    const deletedContent = await Product.findOneAndDelete({ id: req.params.id });
    if (!deletedContent) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete product" });
  }
});

// Start local server (ignored by Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;
