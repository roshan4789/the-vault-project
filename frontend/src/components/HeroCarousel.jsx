import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroCarousel = ({ heroes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!heroes || heroes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroes.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroes]);

  if (!heroes || heroes.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroes.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroes.length) % heroes.length);

  const hero = heroes[currentIndex];

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] bg-black overflow-hidden group border-b border-fuchsia-500/30">
      {/* Background Image */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        <img 
          src={hero.image} 
          alt={hero.title} 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Gradient Overlay for Cinematic Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F10] via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Content Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 lg:px-8 flex flex-col justify-end pb-16">
        <div className="max-w-2xl transform transition-all duration-700 translate-y-0 opacity-100">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(217,70,239,0.8)] mb-4">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium mb-8 drop-shadow-md">
            {hero.description}
          </p>
          <a 
            href={hero.linkUrl || '#'}
            className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded font-black uppercase tracking-widest hover:bg-fuchsia-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {hero.buttonText || 'Shop Now'}
          </a>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-fuchsia-600 border border-white/20 backdrop-blur-md"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-fuchsia-600 border border-white/20 backdrop-blur-md"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {heroes.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? 'w-8 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
