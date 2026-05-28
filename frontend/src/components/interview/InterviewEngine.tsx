"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});
import type { InterviewConfig } from "./ConfigForm";
import type { ResumeAnalysis } from "./ResumeUploader";

type SpeechRecognitionConstructor = new () => {
  lang: string;
  onstart: () => void;
  onresult: (event: { results: { transcript: string }[][] }) => void;
  onend: () => void;
  start: () => void;
};

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type Evaluation = {
  status: "Correct" | "Needs Work";
  score: number;
  message: string;
  answered: boolean;
};

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
  questionFeedback: { question: string; status: string; score: number; message: string }[];
};

type LanguageOption = {
  label: string;
  value: string;
  template: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ai-interview-simulator-3-tdyl.onrender.com";

const languageOptions: LanguageOption[] = [
  { label: "JavaScript", value: "javascript", template: "function solve(input) {\n  // Write your solution here\n  return input;\n}" },
  { label: "TypeScript", value: "typescript", template: "function solve(input: string): string {\n  // Write your solution here\n  return input;\n}" },
  { label: "Python", value: "python", template: "def solve(data):\n    # Write your solution here\n    return data" },
  { label: "Java", value: "java", template: "class Solution {\n  public String solve(String input) {\n    // Write your solution here\n    return input;\n  }\n}" },
  { label: "C++", value: "cpp", template: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Write your solution here\n  return 0;\n}" },
  { label: "C#", value: "csharp", template: "public class Solution {\n  public string Solve(string input) {\n    // Write your solution here\n    return input;\n  }\n}" },
  { label: "Go", value: "go", template: "package main\n\nfunc solve(input string) string {\n  // Write your solution here\n  return input\n}" },
  { label: "Rust", value: "rust", template: "fn solve(input: &str) -> String {\n    // Write your solution here\n    input.to_string()\n}" },
  { label: "SQL", value: "sql", template: "-- Write your query here\nSELECT *\nFROM table_name;" },
];

const fillerWords = ["um", "uh", "like", "actually", "basically", "literally", "you know", "sort of", "kind of"];

const clampQuestionCount = (value: number) => Math.min(20, Math.max(1, value || 5));

const getResumeContext = (resumeAnalysis: ResumeAnalysis | null) => {
  if (!resumeAnalysis) return "";
  return [resumeAnalysis.skills, resumeAnalysis.suggestions].filter(Boolean).join(" ");
};

const buildFallbackQuestions = (domain: string, role: string, config: InterviewConfig, resumeAnalysis: ResumeAnalysis | null = null) => {
  const count = clampQuestionCount(config.numQuestions);
  const resumeContext = getResumeContext(resumeAnalysis);
  const resumeQuestions = resumeContext
    ? [
        `Your resume mentions ${resumeAnalysis?.skills || "relevant experience"}. Walk me through the strongest project related to ${role}.`,
        `Based on your resume, what technical decision are you most prepared to defend in a ${role} interview?`,
        `Pick one resume project and explain the impact, your role, and the hardest tradeoff you made.`,
        `Which skill from your resume is most relevant to ${domain}, and how have you applied it?`,
        `What would you improve in one resume project if you rebuilt it today?`,
      ]
    : [];

  const questionBank: Record<string, string[]> = {
    HR: [
      `Tell me about yourself and why you are interested in the ${role} role.`,
      `Why do you want to work in ${domain}?`,
      `Describe a time you handled feedback and improved your work.`,
      `What are your strengths and weaknesses for this role?`,
      `Where do you see yourself growing as a ${role}?`,
    ],
    Behavioral: [
      `Tell me about a time you solved a difficult problem under pressure.`,
      `Describe a conflict with a teammate and how you handled it.`,
      `Give an example of taking ownership when something went wrong.`,
      `Tell me about a time you had to learn something quickly.`,
      `Describe a project where communication changed the outcome.`,
    ],
    Technical: [
      `Explain one important ${domain} concept a ${role} should know well.`,
      `How would you debug a production issue in a ${domain} system?`,
      `Describe a technical tradeoff you made and why.`,
      `How do you design code so it is maintainable and testable?`,
      `What tools or patterns do you use to improve reliability?`,
    ],
    Coding: [
      `Coding challenge: Write a function that reverses words in a sentence while preserving word order punctuation as much as possible.`,
      `Coding challenge: Given an array of numbers, return the two indices whose values add up to a target.`,
      `Coding challenge: Validate whether a string has balanced parentheses, brackets, and braces.`,
      `Coding challenge: Implement a function that finds the first non-repeating character in a string.`,
      `Coding challenge: Given a list of intervals, merge all overlapping intervals.`,
    ],
  };

  const selectedBank = [...resumeQuestions, ...(questionBank[config.type] || questionBank.Technical)];
  return Array.from({ length: count }, (_, index) => selectedBank[index % selectedBank.length]);
};

const getFillerWordCount = (text: string) => {
  const normalized = text.toLowerCase();
  return fillerWords.reduce((count, word) => {
    const matches = normalized.match(new RegExp(`\\b${word}\\b`, "g"));
    return count + (matches?.length || 0);
  }, 0);
};

const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const isMeaningfulAnswer = (text: string) => {
  const trimmedText = text.trim();
  return trimmedText.length > 0 && !/write your solution here|todo|your code here/i.test(trimmedText);
};

const evaluateAnswer = (answer: string, config: InterviewConfig): Evaluation => {
  const trimmedAnswer = answer.trim();
  const wordCount = getWordCount(trimmedAnswer);
  const fillerCount = getFillerWordCount(trimmedAnswer);

  if (!isMeaningfulAnswer(trimmedAnswer)) {
    return {
      status: "Needs Work",
      score: 0,
      answered: false,
      message: config.type === "Coding"
        ? "No real code was submitted. Placeholder code cannot be marked correct."
        : "Submit an answer first. Empty answers cannot be evaluated.",
    };
  }

  if (config.type === "Coding") {
    const hasImplementationSignal = /(return|for\s*\(|while\s*\(|if\s*\(|def\s+|class\s+|SELECT|func\s+|fn\s+)/i.test(trimmedAnswer);
    const enoughCode = trimmedAnswer.length >= 80;
    const score = hasImplementationSignal && enoughCode ? 88 : 45;

    return {
      status: score >= 70 ? "Correct" : "Needs Work",
      score,
      answered: true,
      message: score >= 70
        ? "Looks correct for practice review: your solution has real implementation structure."
        : "Needs work: add a real algorithm, handle edge cases, and avoid leaving placeholder code.",
    };
  }

  const structureScore = /\b(situation|task|action|result|because|therefore|for example)\b/i.test(trimmedAnswer) ? 20 : 8;
  const lengthScore = Math.min(45, wordCount * 2);
  const fillerPenalty = Math.min(20, fillerCount * 4);
  const score = Math.max(0, Math.min(100, 35 + structureScore + lengthScore - fillerPenalty));

  return {
    status: score >= 70 ? "Correct" : "Needs Work",
    score,
    answered: true,
    message: score >= 70
      ? "Strong answer: it has enough detail and a clear structure."
      : "Needs work: add a specific example, your action, and the result.",
  };
};

const FeedbackMetric = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-white/5">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const buildResultReport = (
  baseResult: { date: string; domain: string; role: string; type: string },
  evaluations: Evaluation[],
  latestMetrics: { confidence: number; speakingSpeed: number; fillerCount: number },
  resumeAnalysis: ResumeAnalysis | null
): InterviewResultReport => {
  const answeredCount = evaluations.filter((evaluation) => evaluation.answered).length;
  const unansweredCount = Math.max(0, evaluations.length - answeredCount);
  const overallScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length)
    : 60;
  const technicalScore = baseResult.type === "HR"
    ? Math.max(60, overallScore - 5)
    : overallScore;
  const communicationScore = Math.max(35, Math.min(100, 90 - latestMetrics.fillerCount * 6 + (latestMetrics.speakingSpeed > 0 ? 5 : 0)));
  const confidenceScore = latestMetrics.confidence || Math.max(45, overallScore - 8);
  const strongAnswers = evaluations.filter((evaluation) => evaluation.score >= 70).length;
  const weakAnswers = evaluations.length - strongAnswers;
  const noMeaningfulAnswers = answeredCount === 0;

  return {
    ...baseResult,
    score: overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    strengths: [
      noMeaningfulAnswers ? "You completed the interview flow, but no meaningful answers were submitted." : strongAnswers > 0 ? "Answered several questions with enough detail and structure." : "Attempted the interview and created a baseline for improvement.",
      resumeAnalysis ? "Resume context was available for personalized questions." : "Role-specific practice questions were attempted.",
      noMeaningfulAnswers ? "The next attempt can improve quickly by submitting complete answers." : latestMetrics.fillerCount <= 2 ? "Kept filler words low in the latest response." : "Built a clear starting point for communication improvement.",
    ],
    weaknesses: [
      unansweredCount > 0 ? `${unansweredCount} question(s) had no meaningful submitted answer.` : weakAnswers > 0 ? "Some answers need more specific examples and measurable results." : "Keep answers concise while preserving detail.",
      latestMetrics.fillerCount > 2 ? "Reduce filler words for a more polished delivery." : "Add stronger closing summaries to answers.",
      baseResult.type === "Coding" ? "Submit real code before finishing, then explain edge cases and complexity." : "Use the STAR format more consistently.",
    ],
    improvementRoadmap: [
      "Review each weak answer and rewrite it with situation, action, and result.",
      baseResult.type === "Coding" ? "Practice one coding problem daily and always state time and space complexity." : "Record two mock answers and check clarity, pace, and filler words.",
      "Create a resume story bank with 5 projects, each mapped to impact, challenges, and lessons.",
    ],
    feedbackSummary: noMeaningfulAnswers
      ? `You completed a ${baseResult.type} interview for ${baseResult.role}, but no meaningful answer was submitted. The score is low because the evaluator could not verify your solution or explanation.`
      : `You completed a ${baseResult.type} interview for ${baseResult.role}. Overall performance is ${overallScore}%, with communication at ${communicationScore}% and confidence at ${confidenceScore}%.`,
    resources: [
      "STAR interview method practice guide",
      baseResult.type === "Coding" ? "LeetCode patterns: arrays, strings, hash maps, intervals" : "Behavioral interview question bank",
      `${baseResult.domain} role-specific system design and fundamentals notes`,
    ],
    chartData: [
      { name: "Overall", score: overallScore },
      { name: "Technical", score: technicalScore },
      { name: "Communication", score: communicationScore },
      { name: "Confidence", score: confidenceScore },
    ],
    questionFeedback: [],
  };
};

export const InterviewEngine = ({
  config,
  domain,
  role,
  resumeAnalysis,
}: {
  config: InterviewConfig | null;
  domain: string | null;
  role: string | null;
  resumeAnalysis: ResumeAnalysis | null;
}) => {
  const router = useRouter();
  const initialResumeQuestions = resumeAnalysis?.questions?.filter(Boolean) || [];
  const initialQuestions = config && domain && role
    ? [...initialResumeQuestions, ...buildFallbackQuestions(domain, role, config, resumeAnalysis)].slice(0, clampQuestionCount(config.numQuestions))
    : [];
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [questionNotice, setQuestionNotice] = useState<string | null>(
    initialQuestions.length > 0
      ? resumeAnalysis
        ? "Resume-based questions loaded. AI questions will replace them if the backend responds."
        : "Practice questions loaded. AI questions will replace them if the backend responds."
      : null
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answer, setAnswer] = useState(config?.type === "Coding" ? languageOptions[0].template : "");
  const [language, setLanguage] = useState("javascript");
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});

  const selectedLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];
  const currentEvaluation = evaluations[currentQuestion];

  const metrics = useMemo(() => {
    if (!isMeaningfulAnswer(answer)) {
      return {
        confidence: 0,
        speakingSpeed: 0,
        fillerCount: 0,
      };
    }

    const wordCount = getWordCount(answer);
    const fillerCount = getFillerWordCount(answer);
    const confidence = answer.trim().length === 0 ? 0 : Math.max(35, Math.min(98, 55 + wordCount * 3 - fillerCount * 7));
    const speakingSpeed = answer.trim().length === 0 ? 0 : Math.min(180, Math.max(80, wordCount * 12));

    return {
      confidence,
      speakingSpeed,
      fillerCount,
    };
  }, [answer]);

  useEffect(() => {
    if (!config || !domain || !role) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/generate-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            role,
            resumeContext: getResumeContext(resumeAnalysis),
            ...config,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Question API returned ${res.status}`);
        }

        const data = await res.json();
        const generatedQuestions = Array.isArray(data.questions)
          ? data.questions.filter((question: unknown): question is string => typeof question === "string" && question.trim().length > 0)
          : [];

        if (generatedQuestions.length === 0) {
          throw new Error("Question API returned no questions");
        }

        const requestedCount = clampQuestionCount(config.numQuestions);
        const paddedQuestions = [...generatedQuestions, ...buildFallbackQuestions(domain, role, config, resumeAnalysis)];
        setQuestions(paddedQuestions.slice(0, requestedCount));
        setQuestionNotice(null);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestionNotice(resumeAnalysis
          ? "Backend AI is not connected, so this session is using resume-based local questions."
          : "Backend AI is not connected, so this session is using generated practice questions.");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [config, domain, role, resumeAnalysis]);

  useEffect(() => {
  if (
    config?.mode === "Voice" &&
    questions.length > 0 &&
    questions[currentQuestion]
  ) {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      const utterance = new SpeechSynthesisUtterance(
        questions[currentQuestion]
      );

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }
}, [currentQuestion, questions, config]);

  const startListening = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const submitAnswer = () => {
    if (!config) return;
    setEvaluations((previousEvaluations) => ({
      ...previousEvaluations,
      [currentQuestion]: evaluateAnswer(answer, config),
    }));
  };

  const goToNextQuestion = () => {
    if (!config) return;

    if (!evaluations[currentQuestion]) {
      submitAnswer();
    }

    if (questions.length > 0 && currentQuestion < questions.length - 1) {
      setCurrentQuestion((previousQuestion) => previousQuestion + 1);
      setAnswer(config.type === "Coding" ? selectedLanguage.template : "");
      return;
    }

    finishInterview();
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

  const finishInterview = async () => {
    if (!config || !domain || !role) return;

    const finalEvaluations = evaluations[currentQuestion]
      ? evaluations
      : { ...evaluations, [currentQuestion]: evaluateAnswer(answer, config) };
    const evaluationList = Object.values(finalEvaluations);
    const averageScore = evaluationList.length > 0
      ? Math.round(evaluationList.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluationList.length)
      : 60;

    const result = buildResultReport({
      date: new Date().toISOString(),
      domain,
      role,
      type: config.type,
    }, evaluationList.length > 0 ? evaluationList : [{ status: "Needs Work", score: averageScore, answered: false, message: "No submitted answers were available." }], metrics, resumeAnalysis);
    result.questionFeedback = questions.map((question, index) => {
      const evaluation = finalEvaluations[index] || {
        status: "Needs Work",
        score: 0,
        message: "This question was not answered.",
      };

      return {
        question,
        status: evaluation.status,
        score: evaluation.score,
        message: evaluation.message,
      };
    });

    const res = await fetch(`${API_BASE_URL}/interview-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: getUserEmail(),
        ...result,
      }),
    });

    if (!res.ok) {
      alert("Could not save result to the database. Please make sure the backend is running.");
      return;
    }

    router.push("/dashboard/interview/result");
  };

  if (loading && questions.length === 0) {
    return <div className="p-8 text-white">Generating your interview questions...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-slate-950 min-h-screen text-white">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-full animate-pulse" />
            <div>
              <h2 className="text-xl font-bold">AI Interviewer</h2>
              <div className="text-sm text-green-400">Live: Analyzing your input...</div>
            </div>
          </div>

          {questionNotice && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {questionNotice}
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-3 py-1">{config?.type}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{config?.difficulty}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{questions.length} questions</span>
          </div>

          <p className="text-2xl font-medium mb-8">{questions[currentQuestion] || "No question available yet."}</p>

          {config?.type === "Coding" ? (
            <div className="w-full h-96 bg-black p-2 rounded-xl border border-indigo-500/50 overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-2 p-1">
                <select
                  value={language}
                  onChange={(e) => {
                    const nextLanguage = languageOptions.find((option) => option.value === e.target.value);
                    setLanguage(e.target.value);
                    setAnswer(nextLanguage?.template || "");
                  }}
                  className="bg-slate-800 text-xs p-2 rounded"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button onClick={submitAnswer} className="bg-green-600 text-xs px-3 py-2 rounded font-bold">Submit Answer</button>
              </div>
              <Editor
                height="82%"
                language={language}
                theme="vs-dark"
                value={answer}
                onChange={(value) => setAnswer(value || "")}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
          ) : (
            <div>
              <textarea
                className="w-full h-40 bg-black/50 p-4 rounded-xl border border-white/10"
                placeholder="Type or speak your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button onClick={submitAnswer} className="mt-3 bg-green-600 px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                Submit Answer
              </button>
            </div>
          )}

          {currentEvaluation && (
            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              currentEvaluation.status === "Correct"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/40 bg-red-500/10 text-red-200"
            }`}>
              <div className="font-bold">{currentEvaluation.status} - {currentEvaluation.score}%</div>
              <div>{currentEvaluation.message}</div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            {config?.mode === "Voice" && config?.type !== "Coding" && (
              <button onClick={startListening} className={`px-6 py-2 rounded-lg font-bold transition ${isListening ? "bg-red-600" : "bg-green-600"}`}>
                {isListening ? "Listening..." : "Speak Answer"}
              </button>
            )}
            <button
              onClick={goToNextQuestion}
              className="bg-indigo-600 px-8 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              {questions.length > 0 && currentQuestion < questions.length - 1 ? "Next Question" : "Finish Interview"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold mb-4">Real-time Analytics</h3>
          <div className="space-y-3">
            <FeedbackMetric label="Confidence" value={`${metrics.confidence}%`} color="text-emerald-400" />
            <FeedbackMetric label="Communication Speed" value={`${metrics.speakingSpeed} WPM`} color="text-blue-400" />
            <FeedbackMetric label="Filler Words" value={metrics.fillerCount.toString()} color={metrics.fillerCount > 2 ? "text-red-400" : "text-emerald-400"} />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold mb-3">Interview Progress</h3>
          <div className="w-full bg-slate-800 h-3 rounded-full">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Question {questions.length > 0 ? currentQuestion + 1 : 0} of {questions.length}</p>
        </div>
      </div>
    </div>
  );
};
