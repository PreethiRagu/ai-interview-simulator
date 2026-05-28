"use client";
import { motion } from "framer-motion";
import { Mic, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

export const DemoPreview = () => {
  return (
    <section id="demo" className="py-24 px-6 bg-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">See the AI in Action</h2>
          <p className="text-slate-400">Experience real-time feedback that traditional mocks can't provide.</p>
        </div>

        {/* The "App Frame" */}
        <div className="relative p-1 rounded-3xl bg-gradient-to-b from-indigo-500/40 to-transparent shadow-2xl">
          <div className="bg-slate-900 rounded-[22px] overflow-hidden border border-white/5 grid md:grid-cols-3">
            
            {/* Mock Sidebar */}
            <div className="hidden md:block bg-slate-950/50 p-6 border-r border-white/5">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-2 w-full bg-slate-800 rounded-full opacity-50" />
                ))}
              </div>
            </div>

            {/* Mock Interview Area */}
            <div className="md:col-span-2 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <BrainIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold">AI Interviewer</p>
                    <p className="text-xs text-green-400">● Live Analysis Active</p>
                  </div>
                </div>
                <div className="px-4 py-1 rounded-full bg-slate-800 text-xs font-mono text-indigo-400">
                  04:22
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-6"
              >
                <p className="text-lg leading-relaxed">
                  "Can you describe a time you handled a conflict within a technical team?"
                </p>
              </motion.div>

              {/* Real-time Feedback Mockup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-3 items-center">
                  <CheckCircle2 className="text-green-500" size={18} />
                  <span className="text-xs font-medium">Confidence: High</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center">
                  <Mic className="text-amber-500" size={18} />
                  <span className="text-xs font-medium">Filler words detected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.48Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.48Z"/></svg>
);