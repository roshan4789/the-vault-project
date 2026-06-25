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
const HeroItem = require('./models/HeroItem');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ---------------------------------------------------------
// DATABASE CONNECTION
// ---------------------------------------------------------
let isDbConnected = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MONGO_URI is missing from .env! Running in 'Offline API' Mode. No data will be saved.");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isDbConnected = true;
    console.log("🟢 Connected to MongoDB Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};
connectDB();

// ---------------------------------------------------------
// MIDDLEWARE: VERIFY USER
// ---------------------------------------------------------
const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Access denied' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

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
    const { name, email, password, rememberMe } = req.body;
    
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
    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign({ userId: user._id, name: user.name, role: 'user' }, process.env.JWT_SECRET, { expiresIn });
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, zip: user.zip } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const { email, password, rememberMe } = req.body;
    
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
    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign({ userId: user._id, name: user.name, role: 'user' }, process.env.JWT_SECRET, { expiresIn });
    
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, zip: user.zip } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// PUBLIC STOREFRONT ROUTES
// ---------------------------------------------------------

app.get('/api/auth/profile', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, zip: user.zip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const { phone, address, city, zip } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (zip !== undefined) user.zip = zip;

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, zip: user.zip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('The Vault Backend API is Running');
});

app.get('/api/products', async (req, res) => {
  if (!process.env.MONGO_URI) {
    console.log("Serving offline mock products...");
    return res.json([]);
  }
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get Single Product & Reviews
app.get('/api/products/:id', async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Offline" });
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json({ product, reviews });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// Post a Review (Verified Purchase Only)
app.post('/api/products/:id/reviews', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Offline" });
  try {
    const productId = req.params.id;
    
    // Check if user has purchased this product (Status: Delivered)
    const orders = await Order.find({ userId: req.user.userId, status: 'Delivered' });
    const hasPurchased = orders.some(order => order.items.some(item => item.productId === productId));
    
    if (!hasPurchased) {
      return res.status(403).json({ error: "You can only review products you have purchased and received." });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: req.user.userId });
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this product." });
    }

    // Create review
    const { rating, comment, userName } = req.body;
    const review = new Review({
      product: productId,
      user: req.user.userId,
      userName: userName,
      rating: Number(rating),
      comment: comment
    });
    await review.save();

    // Recalculate average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    // Update product
    await Product.findOneAndUpdate(
      { id: productId },
      { 
        rating: avgRating.toFixed(1),
        reviews: allReviews.length
      }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit review" });
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

app.get('/api/cart', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.json([]);
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    res.json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.post('/api/cart', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const productId = req.body.id || req.body.productId;
    const authenticProduct = await Product.findOne({ id: productId });
    
    if (!authenticProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = new Cart({ userId: req.user.userId, items: [] });
    
    cart.items.push({
      productId: authenticProduct.id,
      name: authenticProduct.name,
      price: authenticProduct.offerPrice || authenticProduct.price,
      image: authenticProduct.images && authenticProduct.images.length > 0 ? authenticProduct.images[0] : authenticProduct.image
    });
    
    await cart.save();
    res.status(201).json(cart.items[cart.items.length - 1]);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Endpoint to merge local guest cart into user cart upon login
app.post('/api/cart/merge', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const { guestCart } = req.body;
    if (!guestCart || guestCart.length === 0) return res.json({ success: true });

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) cart = new Cart({ userId: req.user.userId, items: [] });
    
    for (const item of guestCart) {
      const productId = item.id || item.productId;
      const authenticProduct = await Product.findOne({ id: productId });
      
      if (authenticProduct) {
        cart.items.push({
          productId: authenticProduct.id,
          name: authenticProduct.name,
          price: authenticProduct.offerPrice || authenticProduct.price,
          image: authenticProduct.images && authenticProduct.images.length > 0 ? authenticProduct.images[0] : authenticProduct.image
        });
      }
    }
    
    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    res.status(500).json({ error: "Failed to merge cart" });
  }
});

app.delete('/api/cart/:id', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
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
app.post('/api/orders', verifyUser, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline." });
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    const order = new Order({
      userId: req.user.userId,
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

// Admin Upload File
app.post('/api/admin/upload', verifyAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the local URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: "File upload failed" });
  }
});

// Admin Get Hero Items
app.get('/api/hero', async (req, res) => {
  if (!process.env.MONGO_URI) return res.json([]);
  try {
    const heroes = await HeroItem.find({ active: true }).sort({ createdAt: -1 });
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch heroes" });
  }
});

// Admin Create Hero Item
app.post('/api/admin/hero', verifyAdmin, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline" });
  try {
    const newHero = new HeroItem(req.body);
    await newHero.save();
    res.status(201).json(newHero);
  } catch (err) {
    res.status(400).json({ error: "Failed to create hero" });
  }
});

// Admin Delete Hero Item
app.delete('/api/admin/hero/:id', verifyAdmin, async (req, res) => {
  if (!process.env.MONGO_URI) return res.status(503).json({ error: "Database offline" });
  try {
    await HeroItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete hero" });
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
