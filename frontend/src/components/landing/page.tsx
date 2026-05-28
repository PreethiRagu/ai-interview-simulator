"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, FileText, Code, CheckCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
            <CheckCircle size={16} />
            <span>Placement-Ready AI Interview Simulator</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-8">
            Master the Interview, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Land the Offer.
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Practice with an AI that analyzes your voice, logic, and coding skills. 
            Get real-time feedback and detailed performance analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Start Mock Interview <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to succeed</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic size={28} className="text-indigo-600" />} 
              title="Voice Analysis" 
              desc="Real-time detection of speaking pace, filler words, and confidence levels." 
            />
            <FeatureCard 
              icon={<FileText size={28} className="text-indigo-600" />} 
              title="Resume Intelligence" 
              desc="AI parses your resume to generate questions tailored specifically to your projects." 
            />
            <FeatureCard 
              icon={<Code size={28} className="text-indigo-600" />} 
              title="Technical Rounds" 
              desc="Integrated code editor with test cases, complexity analysis, and hint generation." 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}