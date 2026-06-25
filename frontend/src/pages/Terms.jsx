import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LightRays } from '../components/LightRays';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans flex flex-col p-4 sm:p-8 font-sans selection:bg-cyan-500 selection:text-black relative">
      <div className="fixed inset-0 z-0 bg-[#0F0F10]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={1.2}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.3}
          noiseAmount={0.03}
          distortion={0.08}
        />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center text-cyan-400 font-bold hover:text-white transition-colors gap-2 group p-4">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Vault
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10 mt-20 mb-20">
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-3xl overflow-hidden p-8 sm:p-12">
          
          <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">Terms and Conditions</h1>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">1. Introduction</h2>
              <p>Welcome to The Vault. By accessing our website and purchasing our digital or physical products, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">2. Purchases and Payments</h2>
              <p>All purchases made through The Vault are subject to product availability. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">3. User Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">4. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of The Vault and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">5. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at support@thevault.com.</p>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
