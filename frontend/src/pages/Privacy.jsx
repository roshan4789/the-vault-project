import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LightRays } from '../components/LightRays';

export default function Privacy() {
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
          
          <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">Privacy Policy</h1>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">2. How We Use Your Information</h2>
              <p>We may use the information we collect to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">3. Sharing of Information</h2>
              <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: With third party service providers; In response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">4. Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@thevault.com.</p>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
