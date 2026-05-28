"use client";
import React from "react";

export default function BrowserMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-2xl bg-slate-900 overflow-hidden shadow-2xl">
      {/* Browser Header */}
      <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
        <div className="ml-4 w-full h-4 rounded-md bg-white/5"></div>
      </div>
      {/* Content Area */}
      <div className="p-6 bg-slate-950/50">
        {children}
      </div>
    </div>
  );
}