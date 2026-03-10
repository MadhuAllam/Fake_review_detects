from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze, trust_score, bot_detection

app = FastAPI(
    title="Fake Review Detection ML Service",
    description="NLP-powered API for fake review detection, trust scoring, and bot detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["Review Analysis"])
app.include_router(trust_score.router, prefix="/api", tags=["Trust Score"])
app.include_router(bot_detection.router, prefix="/api", tags=["Bot Detection"])


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Fake Review Detection ML API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": ["/api/analyze", "/api/trust-score", "/api/bot-check", "/api/health"],
    }


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy"}
