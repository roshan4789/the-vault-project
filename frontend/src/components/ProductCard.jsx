import React from 'react';

export default function ProductCard({ 
  title = "AURA Studio Pro", 
  category = "Wireless Over-Ear", 
  price = "$349", 
  image = "/images/premium_headphones.png" 
}) {
  return (
    <div className="product-card">
      <div className="product-img-container">
        <img 
          src={image} 
          alt={title} 
          className="product-img" 
        />
      </div>
      <div className="product-info">
        <div>
          <h3 className="product-title">{title}</h3>
          <p className="product-category">{category}</p>
        </div>
        <div className="product-price">{price}</div>
      </div>
    </div>
  );
}
