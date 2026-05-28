"use client";
import { useState } from "react";

export const DomainSelector = ({ onSelect }: { onSelect: (domain: string) => void }) => {
  const domains = ["IT", "Mechanical", "Healthcare", "Finance", "Marketing", "Data Science"];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {domains.map((domain) => (
        <button 
          key={domain} 
          onClick={() => onSelect(domain)}
          className="p-6 bg-slate-900 border border-white/10 rounded-xl hover:border-indigo-500 transition"
        >
          {domain}
        </button>
      ))}
    </div>
  );
};