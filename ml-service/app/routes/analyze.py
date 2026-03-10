from fastapi import APIRouter
from pydantic import BaseModel
from app.services.model import analyze_review
from app.services.preprocessor import highlight_suspicious_words

router = APIRouter()


class ReviewRequest(BaseModel):
    text: str
    reviewer_id: str | None = None
    product_id: str | None = None


@router.post("/analyze")
def analyze(req: ReviewRequest):
    result = analyze_review(req.text)
    result["suspicious_words"] = highlight_suspicious_words(req.text)
    result["reviewer_id"] = req.reviewer_id
    result["product_id"] = req.product_id
    return result
