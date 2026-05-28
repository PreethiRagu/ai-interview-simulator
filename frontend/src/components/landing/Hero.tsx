"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import BrowserMockup from "../BrowserMockup";

export const Hero = () => {
  return (
    <section className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] pt-20 px-6">
      {/* Left Content */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-bold tracking-tighter leading-tight mb-6">
          Master Your Interviews with <span className="text-indigo-500">AI Precision</span>
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-lg">
          Practice with a real-time AI interviewer. Get instant feedback on your communication, confidence, and technical depth. Built for high-stakes placement success.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link href="/login" className="px-8 py-4 bg-indigo-600 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
            Start Free Interview
          </Link>
          <Link href="#demo" className="px-8 py-4 bg-slate-800 rounded-full font-semibold hover:bg-slate-700 transition">
            See Demo
          </Link>
        </div>
      </motion.div>

      {/* Right Content: The Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <BrowserMockup>
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-sm font-medium">AI Interviewer initialized...</p>
          </div>
        </BrowserMockup>
      </motion.div>
    </section>
  );
};
