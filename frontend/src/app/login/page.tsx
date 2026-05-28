"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: email.split("@")[0] || "User",
        }),
      });

      if (!res.ok) {
        throw new Error(`Login API returned ${res.status}`);
      }

      const user = await res.json();
      window.localStorage.setItem("interviewUser", JSON.stringify(user));
      router.push("/dashboard");
    } catch {
      setError("Could not connect to the backend database. Make sure FastAPI is running on port 8000.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-md">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Interview<span className="text-indigo-500">AI</span>
            </Link>

            <div className="mt-10">
              <p className="text-sm font-medium text-indigo-300">Welcome back</p>
              <h1 className="mt-2 text-3xl font-bold">Sign in to continue</h1>
              <p className="mt-3 text-sm text-slate-400">
                Access resume-based interviews, coding practice, analytics, and result reports.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-bold hover:bg-indigo-700">
                Sign In
              </button>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </form>

            <p className="mt-6 text-sm text-slate-400">
              New here?{" "}
              <button onClick={() => router.push("/dashboard")} className="font-semibold text-indigo-300 hover:text-indigo-200">
                Continue as demo user
              </button>
            </p>
          </div>
        </section>

        <section className="hidden border-l border-white/10 bg-slate-900 lg:flex lg:items-center lg:px-16">
          <div className="max-w-xl">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-6">
              <p className="text-sm text-slate-400">Today&apos;s preparation</p>
              <h2 className="mt-2 text-2xl font-bold">Resume-aware AI interview</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">Next question</p>
                  <p className="mt-2 text-lg">Explain the hardest tradeoff in your latest project.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Confidence</p>
                    <p className="mt-1 text-xl font-bold text-emerald-400">82%</p>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Speed</p>
                    <p className="mt-1 text-xl font-bold text-blue-400">124</p>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Score</p>
                    <p className="mt-1 text-xl font-bold text-indigo-400">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
