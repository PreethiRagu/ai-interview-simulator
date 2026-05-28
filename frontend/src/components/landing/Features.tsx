"use client";
import { motion } from "framer-motion";
import { Mic, Code, FileText, BarChart3, Users, BrainCircuit } from "lucide-react";

const features = [
  { icon: Mic, title: "Real-time Voice Analysis", desc: "AI detects filler words, speaking pace, and tone to boost your confidence." },
  { icon: Code, title: "Interactive Coding IDE", desc: "Built-in compiler with real-time complexity analysis and hint generation." },
  { icon: FileText, title: "Resume Tailoring", desc: "Upload your PDF and get instant suggestions to match specific job descriptions." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Visualize your growth with detailed trends, domain-wise scores, and charts." },
  { icon: Users, title: "Role-Specific Mocks", desc: "Practice for IT, Finance, Marketing, or Healthcare with industry-specific experts." },
  { icon: BrainCircuit, title: "Adaptive Learning", desc: "AI follow-up questions tailored to your previous answers for deeper learning." },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Everything you need to ace the interview</h2>
        <p className="text-slate-400">Professional-grade tools designed for placement success.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition">
              <f.icon size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};