import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminAuth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Read directly from form to bypass any autocomplete state sync issues
    const form = new FormData(e.target);
    const formUsername = (form.get('username') || username).toString().trim();
    const formPassword = (form.get('password') || password).toString().trim();

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formUsername, password: formPassword })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/command-center-99x/dashboard');
      } else {
        setError(data.error || 'Access Denied');
      }
    } catch (err) {
      setError('Connection refused.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative selection:bg-red-500 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(220,38,38,0.4) 0%, black 70%)' }} />
      
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center text-red-400 font-bold hover:text-white transition-colors gap-2 group p-4">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Store
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 bg-black/60 backdrop-blur-xl border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.15)] rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white text-center tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">Restricted Area</h2>
        <p className="text-red-400 text-center text-sm font-bold mb-8 uppercase tracking-wide">Authorized Personnel Only</p>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm text-center mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Admin ID</label>
            <input 
              type="text" 
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-red-500/20 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
              required 
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Passcode</label>
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-red-500/20 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all font-mono"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? "Authenticating..." : <><Lock size={16} /> Override Protocol</>}
          </button>
        </form>
      </div>
    </div>
  );
}
