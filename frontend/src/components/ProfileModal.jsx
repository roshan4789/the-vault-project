import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export function ProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    zip: user.zip || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
      
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
        setMessage('Profile updated successfully!');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0F0F10] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Shipping Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cyan-500 mb-1 uppercase tracking-wider">Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-500 mb-1 uppercase tracking-wider">Phone Number</label>
            <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-500 mb-1 uppercase tracking-wider">Shipping Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-cyan-500 mb-1 uppercase tracking-wider">City</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-cyan-500 mb-1 uppercase tracking-wider">Zip Code</label>
              <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
