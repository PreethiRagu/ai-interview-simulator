"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { interviewOptions } from "../../../data/interviewOptions";
import { ConfigForm, type InterviewConfig } from "../../../components/interview/ConfigForm";
import dynamic from "next/dynamic";

const InterviewEngine = dynamic(
  () =>
    import("../../../components/interview/InterviewEngine").then(
      (mod) => mod.InterviewEngine
    ),
  { ssr: false }
);
import { ResumeUploader, type ResumeAnalysis } from "../../../components/interview/ResumeUploader";

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(searchParams.get("domain"));
  const [selectedRole, setSelectedRole] = useState<string | null>(searchParams.get("role"));
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [started, setStarted] = useState(false);

  if (!selectedDomain) {
    return (
      <main className="p-8">
        <div className="mb-10 p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Personalize your Interview</h2>
          <p className="text-slate-400 mb-4 text-sm">Upload your PDF resume to receive tailored questions.</p>
          <ResumeUploader onAnalysisComplete={setResumeAnalysis} />
          {resumeAnalysis && (
            <p className="mt-3 text-sm text-emerald-300">Resume context ready for this interview.</p>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-6">Select your Domain</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {interviewOptions.map((opt) => (
            <button key={opt.domain} onClick={() => setSelectedDomain(opt.domain)}
              className="p-6 bg-slate-900 border border-white/10 rounded-xl hover:border-indigo-500 transition">
              {opt.domain}
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (!selectedRole) {
    const domainData = interviewOptions.find(d => d.domain === selectedDomain);
    return (
      <main className="p-8">
        <button onClick={() => setSelectedDomain(null)} className="text-slate-400 mb-4 underline">← Back</button>
        <h1 className="text-2xl font-bold mb-6">Role in {selectedDomain}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {domainData?.roles.map((role) => (
            <button key={role} onClick={() => setSelectedRole(role)}
              className="p-6 bg-slate-900 border border-white/10 rounded-xl hover:bg-indigo-600 transition">
              {role}
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="p-8">
        <button onClick={() => setSelectedRole(null)} className="text-slate-400 mb-4 underline">← Back to Roles</button>
        <ConfigForm onStart={(c) => { setConfig(c); setStarted(true); }} />
      </main>
    );
  }

  if (!config || !selectedDomain || !selectedRole) {
    return (
      <main className="p-8">
        {resumeAnalysis && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Resume personalization is enabled.
          </div>
        )}
        <ConfigForm onStart={(c) => { setConfig(c); setStarted(true); }} />
      </main>
    );
  }

  return (
    <main className="p-8">
      <InterviewEngine config={config} domain={selectedDomain} role={selectedRole} resumeAnalysis={resumeAnalysis} />
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
}