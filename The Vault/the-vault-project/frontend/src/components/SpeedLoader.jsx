import React from 'react';
import { Cpu, Zap } from 'lucide-react';

export const SpeedLoader = ({ text = "Synchronizing with global neural networks" }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0F0F10] flex flex-col items-center justify-center overflow-hidden font-sans">
      <style>{`
        .speed-loader { position: absolute; top: 50%; margin-left: -50px; left: 50%; animation: speeder 0.4s linear infinite; z-index: 10; }
        .speed-loader > span { height: 5px; width: 35px; background: #00ffff; position: absolute; top: -19px; left: 60px; border-radius: 2px 10px 1px 0; box-shadow: 0 0 10px rgba(0,255,255,0.5); }
        .base span { position: absolute; width: 0; height: 0; border-top: 6px solid transparent; border-right: 100px solid #00ffff; border-bottom: 6px solid transparent; filter: drop-shadow(0 0 5px rgba(0,255,255,0.5)); }
        .base span:before { content: ""; height: 22px; width: 22px; border-radius: 50%; background: #00ffff; position: absolute; right: -110px; top: -16px; }
        .base span:after { content: ""; position: absolute; width: 0; height: 0; border-top: 0 solid transparent; border-right: 55px solid #00ffff; border-bottom: 16px solid transparent; top: -16px; right: -98px; }
        .face { position: absolute; height: 12px; width: 20px; background: #00ffff; border-radius: 20px 20px 0 0; transform: rotate(-40deg); right: -125px; top: -15px; }
        .face:after { content: ""; height: 12px; width: 12px; background: #00ffff; right: 4px; top: 7px; position: absolute; transform: rotate(40deg); transform-origin: 50% 50%; border-radius: 0 0 0 2px; }
        .speed-loader > span > span:nth-child(1), .speed-loader > span > span:nth-child(2), .speed-loader > span > span:nth-child(3), .speed-loader > span > span:nth-child(4) { width: 30px; height: 1px; background: #00ffff; position: absolute; animation: fazer1 0.2s linear infinite; }
        .speed-loader > span > span:nth-child(2) { top: 3px; animation: fazer2 0.4s linear infinite; }
        .speed-loader > span > span:nth-child(3) { top: 1px; animation: fazer3 0.4s linear infinite; animation-delay: -1s; }
        .speed-loader > span > span:nth-child(4) { top: 4px; animation: fazer4 1s linear infinite; animation-delay: -1s; }
        @keyframes fazer1 { 0% { left: 0; } 100% { left: -80px; opacity: 0; } }
        @keyframes fazer2 { 0% { left: 0; } 100% { left: -100px; opacity: 0; } }
        @keyframes fazer3 { 0% { left: 0; } 100% { left: -50px; opacity: 0; } }
        @keyframes fazer4 { 0% { left: 0; } 100% { left: -150px; opacity: 0; } }
        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .longfazers { position: absolute; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
        .longfazers span { position: absolute; height: 2px; width: 20%; background: #00ffff; opacity: 0.2; box-shadow: 0 0 10px #00ffff; }
        .longfazers span:nth-child(1) { top: 20%; animation: lf 0.6s linear infinite; animation-delay: -5s; }
        .longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
        .longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
        .longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }
        @keyframes lf { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf3 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        @keyframes lf4 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        @keyframes progress { 0% { transform: translateX(-100%); } 50% { transform: translateX(50%); } 100% { transform: translateX(200%); } }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
      `}</style>

      {/* Background Texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none"></div>

      {/* Long Fazers Background */}
      <div className="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Loader Component Container */}
      <div className="relative w-full max-w-2xl h-[400px] flex items-center justify-center">
        <div className="speed-loader">
          <span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <div className="base">
            <span></span>
            <div className="face"></div>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="z-20 text-center mt-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter text-cyan-400 uppercase animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          Connecting to Vault
        </h1>
        <p className="text-cyan-600/80 font-light tracking-widest uppercase text-xs">
          {text}
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-cyan-950/50 rounded-full mx-auto mt-12 overflow-hidden relative border border-cyan-500/20">
          <div className="h-full bg-cyan-400 w-1/3 animate-[progress_3s_ease-in-out_infinite] shadow-[0_0_10px_#00ffff]" style={{ animationName: 'progress' }}></div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-12 flex flex-col items-start space-y-2 opacity-60">
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#00ffff] animate-pulse"></span>
          <span className="text-cyan-400 font-bold tracking-widest uppercase">SYSTEMS NOMINAL</span>
        </div>
        <div className="text-[10px] text-cyan-600 uppercase tracking-tighter">
          X-RAY DELTA 4.0 // VECTOR PROTOCOL
        </div>
      </div>

      <div className="absolute top-12 right-12 text-right opacity-60 flex flex-col items-end">
        <Cpu className="text-2xl text-cyan-400 mb-2 drop-shadow-[0_0_5px_#00ffff]" />
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
          LATENCY: 14ms
        </div>
      </div>

      {/* Branding */}
      <div className="absolute top-12 left-12">
        <div className="flex items-center space-x-2 group cursor-default">
          <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <Zap className="text-cyan-400 w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">THE VAULT</span>
        </div>
      </div>

    </div>
  );
};
