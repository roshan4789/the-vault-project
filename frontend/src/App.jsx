import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Star, Sparkles, X, Send, Loader2, Bot, Filter, Check, User, LogOut, Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LightRays } from './components/LightRays';
import { SpeedLoader } from './components/SpeedLoader';
import { GlowingEdgeCard } from './components/GlowingEdgeCard';
import { StatsSection } from './components/StatsSection';
import { ProfileModal } from './components/ProfileModal';
import { HeroCarousel } from './components/HeroCarousel';
import { Package } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const categories = ["All", "Figures", "Replicas", "Apparel", "Posters", "Accessories"];

import { useNavigate } from 'react-router-dom';

// ==========================================
// GEMINI API INTEGRATION (Geek Assistant)
// ==========================================
const callGeminiAPI = async (userPrompt) => {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });
    
    if (!response.ok) {
      const err = await response.json();
      return err.error || "System error. Try again!";
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    return "I'm having trouble connecting to the backend server right now.";
  }
};

// ==========================================
// SHARED AI CHAT COMPONENT
// ==========================================
const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: "What can I help you with?" }]);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);
    const response = await callGeminiAPI(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-[350px] sm:w-[380px] flex flex-col h-[500px] max-h-[80vh] bg-black/90 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <div className="p-4 flex justify-between items-center text-black bg-cyan-500 backdrop-blur-md rounded-t-xl border-b border-cyan-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2"><Bot size={20} /><h3 className="font-bold text-sm">Store Assistant</h3></div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 p-1"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm ${msg.role === 'user' ? "bg-fuchsia-500 text-black rounded-lg rounded-br-none shadow-[0_0_10px_rgba(217,70,239,0.5)] font-medium" : "bg-black/80 text-cyan-100 rounded-lg rounded-bl-none border border-cyan-500/30 backdrop-blur-sm shadow-md"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 text-sm flex items-center gap-2 bg-black/80 text-cyan-100 rounded-lg rounded-bl-none border border-cyan-500/30 backdrop-blur-sm shadow-md">
                  <Loader2 size={16} className="animate-spin" /> Fetching data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 flex items-center gap-2 bg-black border-t border-cyan-500/30 rounded-b-xl backdrop-blur-md">
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about products..." className="flex-1 px-3 py-2 text-sm outline-none bg-black/50 border border-cyan-500/50 text-white rounded-md focus:border-cyan-400 placeholder-slate-500 focus:bg-black focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all" disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2.5 flex-shrink-0 disabled:opacity-50 bg-cyan-500 hover:bg-cyan-400 text-black rounded-md shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="p-4 flex items-center gap-2 font-bold bg-black border-2 border-cyan-500 text-cyan-400 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all">
          <Bot size={24} />
        </button>
      )}
    </div>
  );
};

// ==========================================
// THE VAULT (Neon/Universe Layout)
// ==========================================
const NeonVaultLayout = ({ 
  activeCategory, setActiveCategory, displayedProducts, 
  cart, addToCart, stats, user, handleLogout, heroes 
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
  <div className="min-h-screen bg-[#1A1A1B] text-slate-300 font-sans flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
    {/* Dynamic Cinematic Background Layer */}
    <div className="fixed inset-0 z-0 bg-[#0F0F10]">
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={1.2}
        rayLength={1.8}
        followMouse={true}
        mouseInfluence={0.3}
        noiseAmount={0.03}
        distortion={0.08}
      />
    </div>
    
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-8">
        <div className="flex items-center cursor-pointer flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="The Vault Logo" 
            className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
          />
        </div>
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <input type="text" placeholder="Search products..." className="w-full bg-black/80 backdrop-blur-sm border border-cyan-500/30 text-white rounded-md py-2.5 px-4 pr-12 outline-none focus:border-cyan-400 focus:bg-black focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-sm" />
          <button className="absolute right-0 top-0 bottom-0 bg-transparent border-l border-cyan-500/30 hover:bg-cyan-500 text-cyan-400 hover:text-black px-4 rounded-r-md transition-all backdrop-blur-sm"><Search size={18} /></button>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex flex-col items-center hover:text-cyan-400 transition-colors relative"
              >
                <User size={22} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                <span className="text-[10px] mt-1 font-medium tracking-wider text-cyan-400">{user.name.toUpperCase()}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] overflow-hidden z-50 py-2">
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setDropdownOpen(false); setShowProfileModal(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <Settings size={14} />
                    Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="flex flex-col items-center hover:text-cyan-400 transition-colors relative">
              <User size={22} /><span className="text-[10px] mt-1 font-medium tracking-wider">LOGIN</span>
            </Link>
          )}
          <Link to="/cart" className="flex flex-col items-center hover:text-cyan-400 transition-colors relative">
            <ShoppingCart size={22} /><span className="text-[10px] mt-1 font-medium tracking-wider">CART</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(217,70,239,1)]">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Hamburger Menu for Mobile */}
          <button 
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>

    {showProfileModal && user && (
      <ProfileModal 
        user={user} 
        onClose={() => setShowProfileModal(false)} 
        onUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }} 
      />
    )}

    {/* Mobile Categories Menu */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-30 bg-black/95 backdrop-blur-xl pt-24 px-6 pb-6 overflow-y-auto">
        <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
          <Filter size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" /> Category
        </h3>
        <ul className="space-y-6 text-lg">
          {categories.map((cat) => (
            <li 
              key={cat} 
              className="flex items-center gap-4 cursor-pointer" 
              onClick={() => {
                setActiveCategory(cat);
                setMobileMenuOpen(false);
              }}
            >
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${activeCategory === cat ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'border-slate-500'}`}>
                {activeCategory === cat && <Check size={16} strokeWidth={4} />}
              </div>
              <span className={`transition-colors tracking-wide ${activeCategory === cat ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-slate-400'}`}>{cat}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Hero Bar */}
    <HeroCarousel heroes={heroes} />

    <main className="relative z-10 flex-grow max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-60 flex-shrink-0 hidden md:block">
        <div className="sticky top-28 space-y-8 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider flex items-center gap-2"><Filter size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" /> Category</h3>
            <ul className="space-y-3 text-sm">
              {categories.map((cat) => (
                <li key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveCategory(cat)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${activeCategory === cat ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'border-slate-500 group-hover:border-cyan-400'}`}>
                    {activeCategory === cat && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className={`transition-colors tracking-wide ${activeCategory === cat ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-slate-400 group-hover:text-slate-200'}`}>{cat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center bg-black/60 backdrop-blur-md p-4 rounded-xl border border-cyan-500/20 mb-6 text-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <p className="tracking-wide">Showing results for <span className="text-fuchsia-400 font-bold drop-shadow-[0_0_5px_rgba(217,70,239,0.5)] uppercase">"{activeCategory}"</span></p>
        </div>
        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-black/60 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Package size={64} className="text-slate-600 mb-6" />
            <h2 className="text-xl md:text-2xl font-black text-slate-400 uppercase tracking-widest text-center px-4">
              Oops, we do not have anything in the inventory
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map(product => (
              <div key={product.id} className="h-[350px]">
                <GlowingEdgeCard onClick={() => navigate(`/product/${product.id}`)} mode="dark">
                  <div className="relative h-48 bg-black border-b border-cyan-500/20 p-4 flex items-center justify-center">
                    {product.badge && <div className="absolute top-3 left-3 z-10 text-black text-[10px] font-black px-2.5 py-1 uppercase rounded bg-fuchsia-500 backdrop-blur-sm shadow-[0_0_10px_rgba(217,70,239,0.8)] border border-fuchsia-400">{product.badge}</div>}
                    <img src={product.images && product.images.length > 0 ? product.images[0] : product.image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl opacity-90 group-hover:opacity-100" />
                  </div>
                <div className="p-4 flex flex-col flex-grow bg-black/50 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1 drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]">{product.category}</p>
                  <h4 className="text-sm font-bold text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors tracking-wide">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-4 text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]"><Star size={12} fill="currentColor" /><span className="text-[11px] text-slate-400 ml-1">({product.reviews})</span></div>
                  <div className="mt-auto flex justify-between items-center">
                    {product.offerPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500 line-through">₹{product.price.toFixed(2)}</span>
                        <span className="text-lg font-black text-fuchsia-400 drop-shadow-md">₹{product.offerPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-white drop-shadow-md">₹{product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </GlowingEdgeCard>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>

    <StatsSection stats={stats} />

    <AIChat />

    {/* Footer */}
    <footer className="relative z-40 bg-black/80 backdrop-blur-md border-t border-cyan-500/30 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <p>© 2026 The Vault. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  </div>
  );
};

// ==========================================
// ROOT COMPONENT (Handles State & Firebase)
// ==========================================
export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // User State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
  };
  
  // Backend States
  const [liveProducts, setLiveProducts] = useState([]); 
  const [heroes, setHeroes] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('guestCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState('Connecting...');

  // Sync Guest Cart to LocalStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // 1. Fetch Data from Node.js Backend
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const prodRes = await fetch(`${API_BASE}/products`);
        if (prodRes.ok) {
          const products = await prodRes.json();
          setLiveProducts(products);
          setDbStatus('Connected');
        } else {
          setDbStatus('Error Loading Products');
        }

        if (user) {
          const token = localStorage.getItem('token');
          const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            setCart(cartData);
          }
        }
        
        const statsRes = await fetch(`${API_BASE}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const heroRes = await fetch(`${API_BASE}/hero`);
        if (heroRes.ok) {
          setHeroes(await heroRes.json());
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setDbStatus('API Offline');
      }
    };

    fetchData();
  }, []);

  // 2. Handle Add to Cart via REST API
  const addToCart = async (product) => {
    if (!user) {
      const newItem = { ...product, _id: Date.now().toString() };
      setCart(prev => [...prev, newItem]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const newItem = await res.json();
        setCart(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const displayedProducts = activeCategory === "All" 
    ? liveProducts 
    : liveProducts.filter(p => p.category === activeCategory);

  if (dbStatus === 'Connecting...') {
    return <SpeedLoader text="Establishing secure connection to database..." />;
  }

  return (
    <>
      <NeonVaultLayout 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
        displayedProducts={displayedProducts} 
        cart={cart} 
        addToCart={addToCart} 
        stats={stats}
        user={user}
        handleLogout={handleLogout}
        heroes={heroes}
      />
    </>
  );
}