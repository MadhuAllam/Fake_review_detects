from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.services.trust_calculator import calculate_trust_score

router = APIRouter()


class TrustScoreRequest(BaseModel):
    reviewer_id: Optional[str] = None
    review_count: int = 1
    fake_count: int = 0
    avg_review_length: float = 50.0
    unique_products: int = 1
    account_age_days: int = 30
    avg_sentiment: float = 0.5
    sentiment_std: float = 0.2
    burst_detected: bool = False
    duplicate_ratio: float = 0.0
    review_texts: List[str] = []


@router.post("/trust-score")
def trust_score(req: TrustScoreRequest):
    result = calculate_trust_score(req.model_dump())
    result["reviewer_id"] = req.reviewer_id
    return result
