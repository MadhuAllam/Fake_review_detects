import os
import joblib
import numpy as np
from textblob import TextBlob
from app.services.preprocessor import clean_text, extract_text_features

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
_model = None
_vectorizer = None


def _load_model():
    global _model, _vectorizer
    model_path = os.path.join(MODEL_DIR, "fake_review_model.joblib")
    vec_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")

    if os.path.exists(model_path):
        _model = joblib.load(model_path)
        print("✅ Loaded trained model from disk.")
    else:
        print("⚠️  No trained model found. Using heuristic fallback.")
        _model = None

    if os.path.exists(vec_path):
        _vectorizer = joblib.load(vec_path)
    else:
        _vectorizer = None


def _heuristic_fake_score(text: str, features: dict) -> float:
    """Rule-based fake probability when no ML model is trained yet."""
    score = 0.0
    t = text.lower()

    spam_phrases = [
        "amazing", "incredible", "perfect", "must buy", "buy now",
        "best ever", "highly recommend", "do not buy", "total scam",
        "worst ever", "changed my life", "life changing"
    ]
    spam_hits = sum(1 for p in spam_phrases if p in t)
    score += min(spam_hits * 0.12, 0.50)

    if features["exclamation_count"] > 5:
        score += 0.15
    elif features["exclamation_count"] > 2:
        score += 0.07

    if features["caps_ratio"] > 0.3:
        score += 0.15

    if features["vocab_diversity"] < 0.4:
        score += 0.10

    if features["word_count"] < 10:
        score += 0.08

    return min(round(score, 4), 1.0)


def analyze_review(text: str) -> dict:
    global _model, _vectorizer
    if _model is None:
        _load_model()

    features = extract_text_features(text)
    clean = clean_text(text)

    # Sentiment
    blob = TextBlob(text)
    sentiment_score = round((blob.sentiment.polarity + 1) / 2, 4)  # scale 0-1
    sentiment_label = (
        "positive" if blob.sentiment.polarity > 0.1 else
        "negative" if blob.sentiment.polarity < -0.1 else
        "neutral"
    )

    # Fake probability
    if _model is not None:
        proba = _model.predict_proba([clean])[0]
        # class 0 = real, class 1 = fake
        classes = list(_model.classes_)
        fake_idx = classes.index(1) if 1 in classes else 1
        fake_probability = round(float(proba[fake_idx]), 4)
    else:
        fake_probability = _heuristic_fake_score(text, features)

    is_fake = fake_probability >= 0.5
    confidence = fake_probability if is_fake else (1 - fake_probability)

    return {
        "fake_probability": fake_probability,
        "is_fake": is_fake,
        "confidence": round(confidence, 4),
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        "text_features": features,
    }


def get_embedding(text: str) -> list[float]:
    """Return TF-IDF embedding vector for a given text (for cosine similarity)."""
    global _vectorizer
    if _vectorizer is None:
        _load_model()
    if _vectorizer is not None:
        clean = clean_text(text)
        vec = _vectorizer.transform([clean]).toarray()[0]
        return vec.tolist()
    # Fallback: simple character n-gram frequency vector
    clean = clean_text(text)
    words = clean.split()
    from collections import Counter
    freq = Counter(words)
    total = max(sum(freq.values()), 1)
    # Return top-50 word frequencies as a fixed-size vector
    vocab = sorted(freq.keys())[:50]
    vec = [freq.get(w, 0) / total for w in vocab]
    vec += [0.0] * (50 - len(vec))
    return vec
