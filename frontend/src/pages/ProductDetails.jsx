import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { GlowingEdgeCard } from '../components/GlowingEdgeCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  
  // Review Form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(data.product);
        setReviews(data.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      guestCart.push({ ...product, _id: Date.now().toString() });
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      navigate('/cart');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        navigate('/cart');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError("You must be logged in to review.");
      return;
    }
    
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`${API_BASE}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userName: user.name
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }
      
      setReviews([data, ...reviews]);
      setReviewSuccess("Review submitted successfully!");
      setReviewForm({ rating: 5, comment: '' });
      
      // Update local product stats loosely
      setProduct(prev => ({
        ...prev,
        reviews: prev.reviews + 1,
        rating: ((prev.rating * prev.reviews + data.rating) / (prev.reviews + 1)).toFixed(1)
      }));
      
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1B] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#1A1A1B] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">{error || "Product not found"}</h2>
        <Link to="/" className="text-cyan-400 hover:text-cyan-300">Return Home</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-[#1A1A1B] text-slate-300 font-sans">
      {/* Navbar Minimal */}
      <header className="bg-black/80 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft size={20} /> <span className="font-bold uppercase tracking-wider text-sm">Back to Vault</span>
          </Link>
          <Link to="/cart" className="text-cyan-400 hover:text-cyan-300 transition-colors relative">
            <ShoppingCart size={24} />
          </Link>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 flex flex-col gap-12">
        {/* Product Top Section */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Carousel */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square bg-black border border-cyan-500/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.1)] group flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
              <img 
                src={images[currentImageIdx]} 
                alt={product.name} 
                className="relative z-10 max-w-full max-h-full object-contain mix-blend-screen drop-shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-transform duration-500" 
              />
              
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-white/10 backdrop-blur-md">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-white/10 backdrop-blur-md">
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {images.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'w-6 bg-cyan-400' : 'bg-white/30 hover:bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">{product.category}</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6 text-fuchsia-500">
              <Star size={20} fill="currentColor" />
              <span className="text-lg font-bold text-white ml-1">{product.rating}</span>
              <span className="text-slate-400 ml-2">({product.reviews} verified reviews)</span>
            </div>

            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              {product.description || "Experience unparalleled quality with this authentic piece. Meticulously designed for true enthusiasts, it perfectly embodies the aesthetic of The Vault."}
            </p>

            <div className="mb-8">
              {product.offerPrice ? (
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-slate-500 line-through">₹{product.price.toFixed(2)}</span>
                  <span className="text-5xl font-black text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]">₹{product.offerPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <button 
              onClick={addToCart}
              className="bg-cyan-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-cyan-400 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,255,255,0.4)] flex items-center justify-center gap-3 text-lg w-full md:w-auto"
            >
              <ShoppingCart size={24} /> Secure This Artifact
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-cyan-500/20 pt-12">
          <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
            <Star className="text-fuchsia-500" size={32} /> Verified Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 sticky top-28 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <h3 className="text-xl font-bold text-white mb-4">Leave a Review</h3>
                {!user ? (
                  <p className="text-slate-400 text-sm">Please <Link to="/auth" className="text-cyan-400 hover:underline">login</Link> to review this product.</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewError && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm">{reviewError}</div>}
                    {reviewSuccess && <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded text-sm">{reviewSuccess}</div>}
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`p-1 transition-colors ${reviewForm.rating >= star ? 'text-fuchsia-500' : 'text-slate-600'}`}
                          >
                            <Star size={24} fill={reviewForm.rating >= star ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Experience</label>
                      <textarea 
                        required
                        rows="4"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-black/80 border border-cyan-500/30 rounded p-3 text-white outline-none focus:border-cyan-400 focus:bg-black focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all resize-none"
                        placeholder="Tell us what you think..."
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase tracking-wider py-3 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingReview ? <Loader2 size={20} className="animate-spin" /> : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-black/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                  <Star size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No reviews yet.</p>
                  <p className="text-sm">Be the first to secure and review this artifact.</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review._id} className="bg-black/40 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-white text-lg">{review.userName}</p>
                        <p className="text-xs font-mono text-cyan-400 mt-1">Verified Buyer</p>
                      </div>
                      <div className="flex text-fuchsia-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-slate-700' : ''} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-slate-500 mt-4 font-mono">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
