import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Plus, Trash2, Edit, ShieldCheck, Film, Upload, Loader2, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Modal & Form State - Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Figures', price: '', offerPrice: '', images: [], badge: '', reviews: 0, rating: 5, description: '', caption: '' });

  // Modal & Form State - Hero
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroFormData, setHeroFormData] = useState({ title: '', description: '', image: '', linkUrl: '/', buttonText: 'Shop Now' });

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/command-center-99x');
      return;
    }
    fetchData();
  }, [token, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'inventory') {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) setProducts(await res.json());
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_BASE}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } else if (activeTab === 'hero') {
        const res = await fetch(`${API_BASE}/hero`);
        if (res.ok) setHeroes(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });
      if (res.ok) {
        const data = await res.json();
        if (type === 'product') {
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
        } else if (type === 'hero') {
          setHeroFormData(prev => ({ ...prev, image: data.url }));
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
    } catch (err) { console.error("Failed to delete", err); }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '', category: product.category || 'Figures', price: product.price || '',
        offerPrice: product.offerPrice || '', images: product.images || [], badge: product.badge || '',
        reviews: product.reviews || 0, rating: product.rating || 5, description: product.description || '', caption: product.caption || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Figures', price: '', offerPrice: '', images: [], badge: '', reviews: 0, rating: 5, description: '', caption: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `${API_BASE}/admin/products/${editingProduct.id}` : `${API_BASE}/admin/products`;
    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
          reviews: parseInt(formData.reviews),
          rating: parseFloat(formData.rating)
        })
      });
      if (res.ok) {
        const savedProduct = await res.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
          setProducts([savedProduct, ...products]);
        }
        setIsModalOpen(false);
      }
    } catch (err) { console.error("Failed to save product", err); }
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm("Delete this hero banner?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/hero/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setHeroes(heroes.filter(h => h._id !== id));
    } catch (err) { console.error("Failed to delete hero", err); }
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/hero`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(heroFormData)
      });
      if (res.ok) {
        const newHero = await res.json();
        setHeroes([newHero, ...heroes]);
        setIsHeroModalOpen(false);
        setHeroFormData({ title: '', description: '', image: '', linkUrl: '/', buttonText: 'Shop Now' });
      }
    } catch (err) { console.error("Failed to save hero", err); }
  };

  const handleDeliverOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(orders.map(o => o._id === id ? { ...o, status: 'Delivered' } : o));
    } catch (err) { console.error("Failed to deliver order", err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/command-center-99x');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-fuchsia-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="bg-slate-900 border-b border-fuchsia-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-fuchsia-500" />
            <h1 className="text-xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Command Center</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8 flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
            <Package size={20} /> Inventory
          </button>
          <button onClick={() => setActiveTab('hero')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'hero' ? 'bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
            <Film size={20} /> Hero Bar
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
            <ShoppingCart size={20} /> Order Tracking
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[600px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-fuchsia-500" size={32} />
            </div>
          ) : activeTab === 'inventory' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Live Inventory</h2>
                <button onClick={() => handleOpenModal()} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-colors">
                  <Plus size={16} /> New Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-sm text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          {p.images && p.images.length > 0 && <img src={p.images[0]} className="w-10 h-10 rounded bg-black object-cover" alt="" />}
                          <span className="font-bold text-white">{p.name}</span>
                        </td>
                        <td className="p-3 text-slate-400">{p.category}</td>
                        <td className="p-3 text-fuchsia-400 font-bold">₹{p.price.toFixed(2)}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'hero' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Hero Bar Banners</h2>
                <button onClick={() => setIsHeroModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors">
                  <Plus size={16} /> Add Banner
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {heroes.map(h => (
                  <div key={h._id} className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-[3/1] group">
                    <img src={h.image} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-center">
                      <h3 className="text-2xl font-black text-white">{h.title}</h3>
                      <p className="text-slate-300 mt-2">{h.description}</p>
                    </div>
                    <button onClick={() => handleDeleteHero(h._id)} className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No orders have been placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-slate-500">#{order._id.substring(order._id.length - 8)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.status === 'Processing' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-300">{order.items.length} item(s)</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xl font-black text-cyan-400">₹{order.totalAmount.toFixed(2)}</p>
                        {order.status === 'Processing' && (
                          <button onClick={() => handleDeliverOrder(order._id)} className="mt-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold px-3 py-1.5 rounded text-xs">Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#0F0F10] border border-fuchsia-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(217,70,239,0.2)] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-fuchsia-500/30 bg-black/50 flex justify-between items-center sticky top-0 z-20">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none">
                    <option value="Figures">Figures</option>
                    <option value="Replicas">Replicas</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Posters">Posters</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Discounted Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={formData.offerPrice} onChange={e => setFormData({...formData, offerPrice: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" placeholder="Leave blank if no discount" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tag / Badge</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" placeholder="e.g. NEW, LIMITED" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Caption</label>
                  <input type="text" value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" placeholder="Short sub-heading" />
                </div>
                <div className="col-span-2 border border-slate-800 rounded p-4 bg-black/30">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                    <span>Images ({formData.images.length})</span>
                    <label className="cursor-pointer bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-3 py-1 rounded flex items-center gap-2">
                      {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload Local Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, 'product')} />
                    </label>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 group rounded overflow-hidden border border-slate-700">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute inset-0 bg-black/50 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-fuchsia-500/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-slate-400 font-bold uppercase text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-bold uppercase text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHeroModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xl bg-[#0F0F10] border border-indigo-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <div className="p-6 border-b border-indigo-500/30 bg-black/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">New Hero Banner</h3>
              <button onClick={() => setIsHeroModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveHero} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input required type="text" value={heroFormData.title} onChange={e => setHeroFormData({...heroFormData, title: e.target.value})} className="w-full bg-black/50 border border-indigo-500/20 rounded p-2.5 text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <input required type="text" value={heroFormData.description} onChange={e => setHeroFormData({...heroFormData, description: e.target.value})} className="w-full bg-black/50 border border-indigo-500/20 rounded p-2.5 text-white outline-none" />
              </div>
              <div className="border border-slate-800 rounded p-4 bg-black/30">
                <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                  <span>Cinematic Image Background</span>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded flex items-center gap-2">
                    {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, 'hero')} />
                  </label>
                </div>
                {heroFormData.image && (
                  <div className="w-full aspect-video rounded overflow-hidden border border-slate-700 mt-2">
                    <img src={heroFormData.image} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-indigo-500/20">
                <button type="button" onClick={() => setIsHeroModalOpen(false)} className="px-6 py-2 rounded text-slate-400 font-bold uppercase text-sm">Cancel</button>
                <button type="submit" disabled={!heroFormData.image} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase text-sm disabled:opacity-50">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
