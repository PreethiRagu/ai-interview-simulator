"use client";
import { useState } from "react";

export type InterviewConfig = {
  numQuestions: number;
  difficulty: string;
  type: string;
  mode: string;
  company: string;
  timer: number;
};

export const ConfigForm = ({ onStart }: { onStart: (config: InterviewConfig) => void }) => {
  const [config, setConfig] = useState({
    numQuestions: 5, // Added default
    difficulty: "Medium",
    type: "Technical",
    mode: "Typing",
    company: "General",
    timer: 30
  });

  return (
    <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">Configure Interview</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Difficulty */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Difficulty</label>
          <select className="w-full bg-slate-950 p-3 rounded-lg border border-white/10"
            value={config.difficulty}
            onChange={(e) => setConfig({...config, difficulty: e.target.value})}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Interview Type</label>
          <select className="w-full bg-slate-950 p-3 rounded-lg border border-white/10"
            value={config.type}
            onChange={(e) => setConfig({...config, type: e.target.value})}>
            <option>HR</option>
            <option>Technical</option>
            <option>Behavioral</option>
            <option>Coding</option>
          </select>
        </div>

        {/* Number of Questions - NEW */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Number of Questions</label>
          <input type="number" min="1" max="20"
            className="w-full bg-slate-950 p-3 rounded-lg border border-white/10"
            value={config.numQuestions}
            onChange={(e) => setConfig({...config, numQuestions: parseInt(e.target.value) || 1})}
          />
        </div>

        {/* Timer */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Timer (seconds)</label>
          <input type="number" className="w-full bg-slate-950 p-3 rounded-lg border border-white/10"
            value={config.timer}
            onChange={(e) => setConfig({...config, timer: parseInt(e.target.value) || 0})}
          />
        </div>

        {/* Mode */}
        <div className="col-span-2">
          <label className="block text-sm text-slate-400 mb-2">Mode</label>
          <select className="w-full bg-slate-950 p-3 rounded-lg border border-white/10"
            value={config.mode}
            onChange={(e) => setConfig({...config, mode: e.target.value})}>
            <option>Typing</option><option>Voice</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => onStart(config)}
        className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold transition"
      >
        Start Interview Session
      </button>
    </div>
  );
};
