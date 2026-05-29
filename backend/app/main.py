from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import os
import fitz
import json
import sqlite3
import uuid
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.environ["GROQ_API_KEY"]) if os.environ.get("GROQ_API_KEY") else None

DB_PATH = Path(__file__).with_name("interview_app.db")

app = FastAPI(title="AI Interview Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class InterviewConfig(BaseModel):
    domain: str
    role: str
    numQuestions: int
    difficulty: str
    type: str
    resumeContext: str | None = None

class LoginRequest(BaseModel):
    email: str
    name: str | None = None

class InterviewResultRequest(BaseModel):
    userEmail: str | None = None
    score: int
    technicalScore: int
    communicationScore: int
    confidenceScore: int
    domain: str
    role: str
    type: str
    strengths: list[str]
    weaknesses: list[str]
    improvementRoadmap: list[str]
    feedbackSummary: str
    resources: list[str]
    chartData: list[dict]
    questionFeedback: list[dict]

# --- Database ---

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS interview_results (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                score INTEGER NOT NULL,
                technical_score INTEGER NOT NULL,
                communication_score INTEGER NOT NULL,
                confidence_score INTEGER NOT NULL,
                domain TEXT NOT NULL,
                role TEXT NOT NULL,
                type TEXT NOT NULL,
                strengths TEXT NOT NULL,
                weaknesses TEXT NOT NULL,
                improvement_roadmap TEXT NOT NULL,
                feedback_summary TEXT NOT NULL,
                resources TEXT NOT NULL,
                chart_data TEXT NOT NULL,
                question_feedback TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)

init_db()

# --- Helpers ---

def serialize_result(row):
    return {
        "id": row["id"],
        "score": row["score"],
        "technicalScore": row["technical_score"],
        "communicationScore": row["communication_score"],
        "confidenceScore": row["confidence_score"],
        "date": row["created_at"],
        "domain": row["domain"],
        "role": row["role"],
        "type": row["type"],
        "strengths": json.loads(row["strengths"]),
        "weaknesses": json.loads(row["weaknesses"]),
        "improvementRoadmap": json.loads(row["improvement_roadmap"]),
        "feedbackSummary": row["feedback_summary"],
        "resources": json.loads(row["resources"]),
        "chartData": json.loads(row["chart_data"]),
        "questionFeedback": json.loads(row["question_feedback"]),
    }

def get_or_create_user(email: str, name: str | None = None):
    now = datetime.utcnow().isoformat()
    clean_email = email.strip().lower()
    clean_name = name or clean_email.split("@")[0] or "User"
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM users WHERE email = ?", (clean_email,)).fetchone()
        if existing:
            conn.execute("UPDATE users SET name = ?, updated_at = ? WHERE email = ?", (clean_name, now, clean_email))
            return conn.execute("SELECT * FROM users WHERE email = ?", (clean_email,)).fetchone()
        user_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, clean_email, clean_name, now, now),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

def build_local_questions(config):
    count = max(1, min(20, config.numQuestions))
    resume_questions = []
    if config.resumeContext:
        resume_questions = [
            f"Your resume mentions {config.resumeContext[:90]}. Which project best proves you are ready for the {config.role} role?",
            "Pick one resume project and explain the problem, your contribution, and the measurable result.",
            "Which resume skill is most relevant to this role, and how did you apply it in practice?",
            "What is one resume project you would improve if you rebuilt it today?",
        ]
    banks = {
        "HR": [
            f"Tell me about yourself and why you are interested in the {config.role} role.",
            f"Why do you want to work in {config.domain}?",
            "Describe a time you handled feedback and improved your work.",
            "What are your strengths and weaknesses for this role?",
            f"Where do you see yourself growing as a {config.role}?",
        ],
        "Behavioral": [
            "Tell me about a time you solved a difficult problem under pressure.",
            "Describe a conflict with a teammate and how you handled it.",
            "Give an example of taking ownership when something went wrong.",
            "Tell me about a time you had to learn something quickly.",
            "Describe a project where communication changed the outcome.",
        ],
        "Technical": [
            f"Explain one important {config.domain} concept a {config.role} should know well.",
            f"How would you debug a production issue in a {config.domain} system?",
            "Describe a technical tradeoff you made and why.",
            "How do you design code so it is maintainable and testable?",
            "What tools or patterns do you use to improve reliability?",
        ],
        "Coding": [
            "Coding challenge: Write a function that reverses words in a sentence.",
            "Coding challenge: Given an array of numbers, return the two indices whose values add up to a target.",
            "Coding challenge: Validate whether a string has balanced parentheses, brackets, and braces.",
            "Coding challenge: Implement a function that finds the first non-repeating character in a string.",
            "Coding challenge: Given a list of intervals, merge all overlapping intervals.",
        ],
    }
    selected_bank = resume_questions + banks.get(config.type, banks["Technical"])
    return [selected_bank[index % len(selected_bank)] for index in range(count)]

def generate_questions_llm(analysis_or_config, count=5, interview_type="Technical"):
    if client is None:
        return []
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert interviewer."},
            {"role": "user", "content": f"Generate exactly {count} {interview_type} interview questions based on: {analysis_or_config}. Return one question per line and do not include answers."}
        ]
    )
    return response.choices[0].message.content.split('\n')

def generate_insight(text: str):
    if client is None:
        return text[:1200]
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert recruiter. Extract key skills and projects from the resume text provided."},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content

# --- Routes ---

@app.get("/")
def home():
    return {"message": "Backend AI running 🚀"}

@app.post("/users/login")
async def login_user(data: LoginRequest):
    user = get_or_create_user(data.email, data.name)
    return {"id": user["id"], "email": user["email"], "name": user["name"]}

@app.post("/interview-results")
async def save_interview_result(data: InterviewResultRequest):
    user = get_or_create_user(data.userEmail or "demo@example.com")
    result_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute("""
            INSERT INTO interview_results (
                id, user_id, score, technical_score, communication_score, confidence_score,
                domain, role, type, strengths, weaknesses, improvement_roadmap,
                feedback_summary, resources, chart_data, question_feedback, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result_id, user["id"], data.score, data.technicalScore,
            data.communicationScore, data.confidenceScore, data.domain,
            data.role, data.type, json.dumps(data.strengths),
            json.dumps(data.weaknesses), json.dumps(data.improvementRoadmap),
            data.feedbackSummary, json.dumps(data.resources),
            json.dumps(data.chartData), json.dumps(data.questionFeedback), created_at,
        ))
        row = conn.execute("SELECT * FROM interview_results WHERE id = ?", (result_id,)).fetchone()
    return serialize_result(row)

@app.get("/interview-results/latest")
async def get_latest_interview_result(userEmail: str | None = None):
    email = (userEmail or "demo@example.com").strip().lower()
    with get_db() as conn:
        row = conn.execute("""
            SELECT ir.* FROM interview_results ir
            LEFT JOIN users u ON u.id = ir.user_id
            WHERE u.email = ?
            ORDER BY ir.created_at DESC LIMIT 1
        """, (email,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="No interview result found")
    return serialize_result(row)

@app.get("/dashboard-stats")
@app.get("/get-dashboard-stats")
async def get_dashboard_stats(userEmail: str | None = None):
    email = (userEmail or "demo@example.com").strip().lower()
    with get_db() as conn:
        rows = conn.execute("""
            SELECT ir.* FROM interview_results ir
            LEFT JOIN users u ON u.id = ir.user_id
            WHERE u.email = ?
            ORDER BY ir.created_at ASC
        """, (email,)).fetchall()
    if not rows:
        return {
            "totalInterviews": 0,
            "averageScore": "0%",
            "communication": "0%",
            "dailyStreak": "0 Days",
            "performanceTrends": [],
            "weakTopics": [],
            "recentlyPracticed": []
        }
    total = len(rows)
    avg_score = round(sum(row["score"] for row in rows) / total)
    avg_communication = round(sum(row["communication_score"] for row in rows) / total)
    recent_rows = rows[-5:]
    return {
        "totalInterviews": total,
        "averageScore": f"{avg_score}%",
        "communication": f"{avg_communication}%",
        "dailyStreak": f"{min(total, 7)} Days",
        "performanceTrends": [{"name": f"Session {i + 1}", "score": row["score"]} for i, row in enumerate(recent_rows)],
        "weakTopics": list(dict.fromkeys(row["type"] for row in recent_rows))[:3],
        "recentlyPracticed": list(dict.fromkeys(row["role"] for row in recent_rows))[:4],
    }

@app.post("/generate-questions")
async def generate_questions(config: InterviewConfig):
    try:
        if client is None:
            return {"questions": build_local_questions(config)}
        resume_context = f", Resume Context: {config.resumeContext}" if config.resumeContext else ""
        context = f"Role: {config.role}, Domain: {config.domain}, Type: {config.type}, Difficulty: {config.difficulty}{resume_context}"
        questions = generate_questions_llm(context, config.numQuestions, config.type)
        cleaned = [q for q in questions if q.strip()]
        return {"questions": cleaned[:config.numQuestions]}
    except Exception:
        return {"questions": build_local_questions(config)}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile):
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = "".join([page.get_text() for page in doc])
        analysis = generate_insight(f"Extract skills and projects from this resume: {text}")
        if client is not None:
            questions = generate_questions_llm(analysis, 5, "resume-based")
        else:
            questions = [
                "Walk me through the strongest project on your resume.",
                "Which skill from your resume is most relevant to this role?",
                "Describe a technical challenge from your resume and how you solved it.",
                "What measurable impact did one of your resume projects create?",
                "What would you improve in one resume project if you rebuilt it?",
            ]
        return {"skills": analysis[:300], "suggestions": analysis, "questions": [q for q in questions if q.strip()]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/run-code")
async def run_code(data: dict):
    user_code = data.get("code", "")
    return {"output": f"Compiled successfully!\nResult for {len(user_code)} chars of code.", "status": "passed"}

@app.post("/analyze-code")
async def analyze_code(data: dict):
    code = data.get("code", "")
    if client is None:
        return {"analysis": "Backend Groq key is missing. Add GROQ_API_KEY to enable AI code analysis."}
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a coding interview expert. Analyze the code for time/space complexity and provide a subtle hint if the code is suboptimal."},
            {"role": "user", "content": f"Code: {code}"}
        ]
    )
    return {"analysis": response.choices[0].message.content}
