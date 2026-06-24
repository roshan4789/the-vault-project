import React, { useState, useEffect, useRef } from 'react';

const CountUp = ({ end, duration = 2000, label, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 } // Triggers when 10% of the element is visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutExpo for a dynamic slowdown at the end
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * easeProgress));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] transition-all duration-500 group hover:-translate-y-2">
      <div className="text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tighter flex items-center group-hover:text-cyan-300 transition-colors">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-bold text-cyan-500 uppercase tracking-[0.3em] group-hover:text-fuchsia-400 transition-colors">
        {label}
      </div>
    </div>
  );
};

export const StatsSection = ({ stats }) => {
  const data = stats || { activeUsers: 0, artifactsSecured: 0, itemsShipped: 0 };
  
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-20 mt-12 mb-20 border-t border-cyan-500/20 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          Global Vault Data
        </h2>
        <div className="flex items-center justify-center gap-4 mt-4 opacity-70">
           <div className="h-[1px] w-12 bg-cyan-500/50"></div>
           <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">
             Live Synchronization Matrix
           </p>
           <div className="h-[1px] w-12 bg-cyan-500/50"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        <CountUp end={data.activeUsers} label="Active Users" duration={2500} />
        <CountUp end={data.artifactsSecured} label="Artifacts Secured" duration={2000} />
        <CountUp end={data.itemsShipped || 0} label="Items Shipped" duration={3000} />
      </div>
    </section>
  );
};
