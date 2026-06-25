import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Plus, Trash2, Edit, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Figures', price: '', offerPrice: '', image: '', badge: '', reviews: 0, rating: 5, description: '', caption: '' });

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
      } else {
        const res = await fetch(`${API_BASE}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || 'Figures',
        price: product.price || '',
        offerPrice: product.offerPrice || '',
        image: product.image || '',
        badge: product.badge || '',
        reviews: product.reviews || 0,
        rating: product.rating || 5,
        description: product.description || '',
        caption: product.caption || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Figures', price: '', offerPrice: '', image: '', badge: '', reviews: 0, rating: 5, description: '', caption: '' });
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
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const handleDeliverOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: 'Delivered' } : o));
      }
    } catch (err) {
      console.error("Failed to deliver order", err);
    }
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
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
              activeTab === 'inventory' 
                ? 'bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Package size={20} /> Inventory Manager
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ShoppingCart size={20} /> Order Tracking
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[600px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500"></div>
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
                          <img src={p.image} className="w-10 h-10 rounded bg-black object-cover" alt="" />
                          <span className="font-bold text-white">{p.name}</span>
                        </td>
                        <td className="p-3 text-slate-400">{p.category}</td>
                        <td className="p-3 text-fuchsia-400 font-bold">
                          {p.offerPrice ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 line-through">₹{p.price.toFixed(2)}</span>
                              <span>₹{p.offerPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>₹{p.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors" title="Edit Product">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete Product">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'Processing' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                            order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                        <p className="text-sm font-bold text-slate-300 mt-2">{order.items.length} item(s)</p>
                      </div>
                      <div className="flex flex-col md:items-end justify-center">
                        <p className="text-xs text-slate-500 uppercase">Total Amount</p>
                        <p className="text-xl font-black text-cyan-400">₹{order.totalAmount.toFixed(2)}</p>
                        {order.status === 'Processing' && (
                          <button 
                            onClick={() => handleDeliverOrder(order._id)}
                            className="mt-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/50 font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            Mark Delivered
                          </button>
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

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#0F0F10] border border-fuchsia-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(217,70,239,0.2)]">
            <div className="p-6 border-b border-fuchsia-500/30 bg-black/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors">
                    <option value="Figures">Figures</option>
                    <option value="Replicas">Replicas</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Posters">Posters</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Original Price (₹)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Offer Price (Optional)</label>
                  <input type="number" step="0.01" value={formData.offerPrice} onChange={e => setFormData({...formData, offerPrice: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL</label>
                  <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Badge (Optional)</label>
                  <input type="text" placeholder="e.g. Bestseller, New, Low Stock" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Caption</label>
                  <input type="text" placeholder="Short tagline" value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows="3" placeholder="Full product description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/20 rounded p-2.5 text-white focus:border-fuchsia-500 outline-none transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-fuchsia-500/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-slate-400 font-bold uppercase text-sm hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-bold uppercase text-sm shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
