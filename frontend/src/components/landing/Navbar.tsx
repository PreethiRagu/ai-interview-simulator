"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-10 py-5 bg-slate-950/50 backdrop-blur-md border-b border-white/10"
    >
      <div className="text-2xl font-bold tracking-tighter">
        Interview<span className="text-indigo-500">AI</span>
      </div>

      <div className="flex gap-8 text-sm text-slate-300 items-center">
        <Link href="#features" className="hover:text-white transition">Features</Link>
        <Link href="#demo" className="hover:text-white transition">Live Demo</Link>
        <Link href="/login" className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-slate-200 transition">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
};