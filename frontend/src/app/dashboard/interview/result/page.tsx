"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type InterviewResultReport = {
  score: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  date: string;
  domain: string;
  role: string;
  type: string;
  strengths: string[];
  weaknesses: string[];
  improvementRoadmap: string[];
  feedbackSummary: string;
  resources: string[];
  chartData: { name: string; score: number }[];
  questionFeedback?: { question: string; status: string; score: number; message: string }[];
};

const getUserEmail = () => {
  try {
    const savedUser = window.localStorage.getItem("interviewUser");
    const user = savedUser ? JSON.parse(savedUser) : null;
    return user?.email || "demo@example.com";
  } catch {
    return "demo@example.com";
  }
};

const ScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-white">{value}%</p>
  </div>
);

const ListPanel = ({ title, items }: { title: string; items: string[] }) => (
  <section className="rounded-xl border border-white/10 bg-slate-900 p-6">
    <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300">
          {item}
        </div>
      ))}
    </div>
  </section>
);

const downloadReport = (result: InterviewResultReport) => {
  const reportText = [
    `Interview Report - ${result.role}`,
    `Date: ${new Date(result.date).toLocaleString()}`,
    `Domain: ${result.domain}`,
    `Type: ${result.type}`,
    "",
    `Overall Score: ${result.score}%`,
    `Technical Score: ${result.technicalScore}%`,
    `Communication Score: ${result.communicationScore}%`,
    `Confidence Score: ${result.confidenceScore}%`,
    "",
    "AI Feedback Summary",
    result.feedbackSummary,
    "",
    "Strengths",
    ...result.strengths.map((item) => `- ${item}`),
    "",
    "Weaknesses",
    ...result.weaknesses.map((item) => `- ${item}`),
    "",
    "Improvement Roadmap",
    ...result.improvementRoadmap.map((item) => `- ${item}`),
    "",
    "Suggested Learning Resources",
    ...result.resources.map((item) => `- ${item}`),
    "",
    "Question Feedback",
    ...(result.questionFeedback || []).map((item, index) => `${index + 1}. ${item.question}\n   ${item.status} - ${item.score}%: ${item.message}`),
  ].join("\n");

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `interview-report-${result.role.toLowerCase().replace(/\s+/g, "-")}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function InterviewResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<InterviewResultReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview-results/latest?userEmail=${encodeURIComponent(getUserEmail())}`);
        if (!res.ok) {
          throw new Error(`Result API returned ${res.status}`);
        }
        setResult(await res.json());
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold">Loading interview result...</h1>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold">No interview result found</h1>
          <button onClick={() => router.push("/dashboard/interview")} className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-bold">
            Start Interview
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">{result.type} interview result</p>
          <h1 className="text-3xl font-bold">{result.role}</h1>
          <p className="mt-1 text-slate-400">{result.domain}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => downloadReport(result)} className="rounded-lg bg-emerald-600 px-5 py-3 font-bold hover:bg-emerald-700">
            Download Report
          </button>
          <button onClick={() => router.push("/dashboard")} className="rounded-lg bg-indigo-600 px-5 py-3 font-bold hover:bg-indigo-700">
            Back to Dashboard
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <ScoreCard label="Overall Score" value={result.score} />
        <ScoreCard label="Technical Score" value={result.technicalScore} />
        <ScoreCard label="Communication" value={result.communicationScore} />
        <ScoreCard label="Confidence" value={result.confidenceScore} />
      </section>

      <section className="mb-8 rounded-xl border border-white/10 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-bold">Score Breakdown</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-white/10 bg-slate-900 p-6">
        <h2 className="mb-3 text-lg font-bold">AI Feedback Summary</h2>
        <p className="text-slate-300">{result.feedbackSummary}</p>
      </section>

      {result.questionFeedback && result.questionFeedback.length > 0 && (
        <section className="mb-8 rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-bold">Question-by-Question Feedback</h2>
          <div className="space-y-3">
            {result.questionFeedback.map((item, index) => (
              <div key={`${item.question}-${index}`} className="rounded-lg bg-slate-950 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <p className="text-sm text-slate-300">{index + 1}. {item.question}</p>
                  <span className={item.score >= 70 ? "text-sm font-bold text-emerald-400" : "text-sm font-bold text-red-400"}>
                    {item.status} - {item.score}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListPanel title="Strengths" items={result.strengths} />
        <ListPanel title="Weaknesses" items={result.weaknesses} />
        <ListPanel title="Improvement Roadmap" items={result.improvementRoadmap} />
        <ListPanel title="Suggested Learning Resources" items={result.resources} />
      </div>
    </main>
  );
}
