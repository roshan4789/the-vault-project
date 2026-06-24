import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">THE VAULT</div>
      <div className="nav-links">
        <a href="#" className="nav-link">Store</a>
        <a href="#" className="nav-link">Collections</a>
        <a href="#" className="nav-link">About</a>
      </div>
    </nav>
  );
}
