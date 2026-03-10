from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.services.bot_engine import check_bot

router = APIRouter()


class ReviewItem(BaseModel):
    text: str
    timestamp: Optional[str] = None
    user_id: Optional[str] = None


class BotCheckRequest(BaseModel):
    reviewer_id: Optional[str] = None
    reviews: List[ReviewItem]


@router.post("/bot-check")
def bot_check(req: BotCheckRequest):
    reviews_dicts = [r.model_dump() for r in req.reviews]
    result = check_bot(reviews_dicts)
    result["reviewer_id"] = req.reviewer_id
    return result
