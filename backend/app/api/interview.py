from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import start_interview, continue_interview

router = APIRouter()

# -------- REQUEST MODELS --------

class StartRequest(BaseModel):
    role: str

class ContinueRequest(BaseModel):
    session_id: int
    answer: str

# -------- START INTERVIEW --------
@router.post("/start")
def start(data: StartRequest):
    return start_interview(data.role)

# -------- CONTINUE INTERVIEW --------
@router.post("/continue")
def follow_up(data: ContinueRequest):
    return continue_interview(data.session_id, data.answer)
