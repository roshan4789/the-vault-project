import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, Lock } from 'lucide-react';
import { LightRays } from '../components/LightRays';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const [checkoutData, setCheckoutData] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '',
    address: user?.address || '', 
    city: user?.city || '', 
    zip: user?.zip || '', 
    card: '' 
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user) {
          const guestCart = localStorage.getItem('guestCart');
          setCartItems(guestCart ? JSON.parse(guestCart) : []);
        } else {
          const res = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          }
        }
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [user, token]);

  const handleRemove = async (id) => {
    try {
      const updatedCart = cartItems.filter(item => item._id !== id);
      setCartItems(updatedCart);
      
      if (!user) {
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      } else {
        await fetch(`${API_BASE}/cart/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      alert("Please log in or create an account to securely checkout.");
      window.location.href = '/auth';
      return;
    }
    setShowCheckoutForm(true);
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);
    try {
      if (user) {
        const updatedProfile = {
          name: checkoutData.name,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city,
          zip: checkoutData.zip
        };
        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedProfile)
        });
        if (profileRes.ok) {
          const updatedUser = await profileRes.json();
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("Order verified and securely placed!");
        setCartItems([]);
        setShowCheckoutForm(false);
      } else {
        alert("Checkout failed. Your vault may be empty.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans p-4 md:p-8 relative selection:bg-cyan-500 selection:text-black">
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

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-cyan-400 font-bold hover:text-white transition-colors gap-2 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Vault
          </Link>
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
            <h1 className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Checkout</h1>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <ShoppingBag size={48} className="mx-auto text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Your vault is empty</h2>
            <p className="text-slate-400 mb-8">Looks like you haven't added any gear to your cart yet.</p>
            <Link to="/" className="inline-block bg-cyan-500 text-black font-bold uppercase tracking-wider px-8 py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              Explore Store
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 tracking-wide border-b border-cyan-500/30 pb-2">Your Items ({cartItems.length})</h2>
              {cartItems.map((item, idx) => (
                <div key={item._id || idx} className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 flex gap-4 items-center hover:border-cyan-400 transition-colors group">
                  <div className="w-20 h-20 bg-black rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=200"} 
                      alt={item.name} 
                      className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">{item.name}</h3>
                    <p className="text-cyan-500 font-bold mb-2">₹{item.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="sticky top-8 bg-black/80 backdrop-blur-xl border border-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.15)] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 tracking-wide uppercase flex items-center gap-2">
                <CreditCard size={18} className="text-fuchsia-400" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-white">{shipping === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-lg font-black text-white">
                  <span>Total</span>
                  <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckoutClick}
                disabled={isCheckingOut}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex justify-center items-center gap-2 mb-4"
              >
                {isCheckingOut ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div> Processing</>
                ) : (
                  <>Secure Checkout</>
                )}
              </button>
              
              <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-2">
                <Lock size={12} /> Encrypted SSL Payment
              </p>
            </div>
            
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCheckoutForm(false)} />
            <div className="relative z-10 w-full max-w-md bg-[#0F0F10] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
              <h2 className="text-xl font-bold text-white mb-4">Secure Checkout</h2>
              <form onSubmit={processCheckout} className="space-y-4">
                <input required type="text" placeholder="Full Name" value={checkoutData.name} onChange={e=>setCheckoutData({...checkoutData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                <input required type="text" placeholder="Phone Number" value={checkoutData.phone} onChange={e=>setCheckoutData({...checkoutData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                <input required type="text" placeholder="Shipping Address" value={checkoutData.address} onChange={e=>setCheckoutData({...checkoutData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                <div className="flex gap-4">
                  <input required type="text" placeholder="City" value={checkoutData.city} onChange={e=>setCheckoutData({...checkoutData, city: e.target.value})} className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                  <input required type="text" placeholder="Zip Code" value={checkoutData.zip} onChange={e=>setCheckoutData({...checkoutData, zip: e.target.value})} className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                </div>
                <input required type="text" placeholder="Card Number (Mock)" value={checkoutData.card} onChange={e=>setCheckoutData({...checkoutData, card: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCheckoutForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isCheckingOut} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors">
                    {isCheckingOut ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
