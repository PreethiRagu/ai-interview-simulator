
"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { StatCard } from "./StatCard";
import { PerformanceChart } from "./PerformanceChart";

type DashboardStats = {
  totalInterviews: number;
  averageScore: string;
  communication: string;
  dailyStreak: string;
  weakTopics: string[];
  recentlyPracticed: string[];
  performanceTrends: { name: string; score: number }[];
};

const defaultStats: DashboardStats = {
  totalInterviews: 0,
  averageScore: "0%",
  communication: "0%",
  dailyStreak: "0 Days",
  weakTopics: [],
  recentlyPracticed: [],
  performanceTrends: [],
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

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`https://ai-interview-simulator-3-tdyl.onrender.com=${encodeURIComponent(getUserEmail())}`);
        if (res.ok) {
          const data = await res.json();
          const backendStats: DashboardStats = {
            ...defaultStats,
            ...data,
            performanceTrends: Array.isArray(data.performanceTrends)
              ? data.performanceTrends.map((item: { name?: string; score?: number } | number, index: number) => (
                typeof item === "number"
                  ? { name: `Session ${index + 1}`, score: item }
                  : { name: item.name || `Session ${index + 1}`, score: item.score || 0 }
              ))
              : defaultStats.performanceTrends,
          };
          setStats(backendStats);
        }
      } catch {
        console.log("Backend not connected, staying with default values.");
      }
    };
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Developer! 👋</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold">JD</div>
      </header>

      {/* 2. Progress Analytics (Using dynamic stats object) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Interviews" value={stats.totalInterviews.toString()} />
        <StatCard title="Average Score" value={stats.averageScore} />
        <StatCard title="Communication" value={stats.communication} />
        <StatCard title="Daily Streak" value={stats.dailyStreak} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
          <PerformanceChart data={stats.performanceTrends} />
        </div>

        <div className="space-y-6">
          {/* Weak Topics (Dynamic Mapping) */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Weak Topic Analysis</h2>
            <div className="space-y-3">
              {stats.weakTopics.map((topic) => (
                <div key={topic} className="flex justify-between text-sm">
                  <span className="text-slate-400">{topic}</span>
                  <span className="text-red-400">Needs Work</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Recently Practiced</h2>
            <div className="flex gap-2">
              {stats.recentlyPracticed.map((tag) => (
                <span key={tag} className="bg-slate-800 px-3 py-1 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/30 flex justify-between items-center">
        <button 
          onClick={() => router.push('/dashboard/interview')}
          className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold transition w-full"
        >
          Start New Interview
        </button>
      </section>
    </main>
  );
}
