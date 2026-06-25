import React from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

export default function Storefront() {
  const temporaryProducts = [
    { id: 1, title: "AURA Studio Pro", category: "Wireless Over-Ear", price: "$349", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
    { id: 2, title: "SONIC V2 Earbuds", category: "True Wireless", price: "$199", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80" },
    { id: 3, title: "ECHO Soundbar", category: "Home Audio", price: "$499", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80" },
    { id: 4, title: "BASS Tower Speaker", category: "Home Audio", price: "$899", image: "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=400&q=80" },
    { id: 5, title: "NOVA ANC Headphones", category: "Noise Cancelling", price: "$299", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80" },
    { id: 6, title: "BEATS Studio Pro", category: "Wireless Over-Ear", price: "$349", image: "https://images.unsplash.com/photo-1546435770-a3e426fa99f5?auto=format&fit=crop&w=400&q=80" },
  ];

  return (
    <>
      <div className="bg-glow"></div>
      <div>
        <Navbar />
        <main className="main-content">
          <div className="hero-section">
            <h1 className="hero-title">Elevate Your Audio</h1>
            <p className="hero-subtitle">Discover our premium collection of audiophile gear designed for uncompromising sound quality and minimalist aesthetics.</p>
          </div>
          <div className="product-grid">
            {temporaryProducts.map(product => (
              <ProductCard 
                key={product.id}
                title={product.title}
                category={product.category}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
