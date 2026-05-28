"use client";
import { useState } from "react";

export type ResumeAnalysis = {
  skills: string;
  suggestions: string;
  questions?: string[];
};

export const ResumeUploader = ({ onAnalysisComplete }: { onAnalysisComplete: (data: ResumeAnalysis) => void }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Resume API returned ${res.status}`);
      }

      const data = await res.json();
      onAnalysisComplete(data);
      setMessage("Resume analyzed. Questions will use your resume context.");
    } catch (err) {
      console.error("Analysis failed", err);
      setMessage("Resume analysis failed. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" id="resume-upload" />
      <label 
        htmlFor="resume-upload" 
        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl cursor-pointer font-bold text-center transition"
      >
        {loading ? "Analyzing..." : "Upload PDF Resume"}
      </label>
      {message && <p className="text-xs text-slate-300">{message}</p>}
    </div>
  );
};
