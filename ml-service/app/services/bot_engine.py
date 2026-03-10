import numpy as np
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from app.services.preprocessor import clean_text
from app.services.model import get_embedding

# Thresholds
SIMILARITY_THRESHOLD = 0.90
BURST_WINDOW_SECONDS = 60   # reviews within 60s = burst
MIN_REVIEWS_FOR_BURST = 3


def check_bot(reviews: list[dict]) -> dict:
    """
    Analyse a list of review dicts for bot patterns.

    Each review dict should have:
        text      : str
        timestamp : ISO8601 string (optional)
        user_id   : str (optional)

    Returns bot analysis result.
    """
    if not reviews:
        return {"is_bot": False, "confidence": 0.0, "flags": [], "details": {}}

    texts = [r.get("text", "") for r in reviews]
    timestamps = [r.get("timestamp") for r in reviews]

    flags = []
    details = {}

    # ── 1. Cosine similarity check ────────────────────────────────────────────
    embeddings = []
    for t in texts:
        emb = get_embedding(t)
        embeddings.append(emb)

    if len(embeddings) > 1:
        matrix = np.array(embeddings)
        # Pad all embeddings to same length
        max_len = max(len(e) for e in embeddings)
        padded = np.array([e + [0.0] * (max_len - len(e)) for e in embeddings])

        sim_matrix = cosine_similarity(padded)
        # Get upper triangle (excluding diagonal)
        n = sim_matrix.shape[0]
        upper_sims = [sim_matrix[i, j] for i in range(n) for j in range(i + 1, n)]
        avg_similarity = float(np.mean(upper_sims)) if upper_sims else 0.0
        max_similarity = float(np.max(upper_sims)) if upper_sims else 0.0
        pair_count_above_threshold = sum(1 for s in upper_sims if s >= SIMILARITY_THRESHOLD)

        details["avg_similarity"] = round(avg_similarity, 4)
        details["max_similarity"] = round(max_similarity, 4)
        details["high_similarity_pairs"] = pair_count_above_threshold

        if max_similarity >= SIMILARITY_THRESHOLD:
            flags.append({
                "type": "high_text_similarity",
                "severity": "high",
                "detail": f"Max cosine similarity {max_similarity:.2f} ≥ {SIMILARITY_THRESHOLD}"
            })
        elif avg_similarity >= 0.70:
            flags.append({
                "type": "moderate_text_similarity",
                "severity": "medium",
                "detail": f"Average cosine similarity {avg_similarity:.2f}"
            })

    # ── 2. Posting frequency / burst detection ────────────────────────────────
    parsed_times = []
    for ts in timestamps:
        if ts:
            try:
                parsed_times.append(datetime.fromisoformat(str(ts).replace("Z", "+00:00")))
            except Exception:
                pass

    burst_detected = False
    if len(parsed_times) >= MIN_REVIEWS_FOR_BURST:
        sorted_times = sorted(parsed_times)
        for i in range(len(sorted_times) - MIN_REVIEWS_FOR_BURST + 1):
            window = sorted_times[i: i + MIN_REVIEWS_FOR_BURST]
            span = (window[-1] - window[0]).total_seconds()
            if span <= BURST_WINDOW_SECONDS:
                burst_detected = True
                details["burst_window_seconds"] = span
                flags.append({
                    "type": "review_burst",
                    "severity": "high",
                    "detail": f"{MIN_REVIEWS_FOR_BURST} reviews posted within {span:.0f}s"
                })
                break

    details["burst_detected"] = burst_detected
    details["total_reviews_analyzed"] = len(reviews)

    # ── 3. Repeated sentiment check ───────────────────────────────────────────
    sentiments = []
    for t in texts:
        words = t.lower().split()
        pos_words = {"amazing", "perfect", "best", "love", "great", "incredible"}
        neg_words = {"terrible", "worst", "garbage", "scam", "broken", "avoid"}
        pos_hits = sum(1 for w in words if w in pos_words)
        neg_hits = sum(1 for w in words if w in neg_words)
        if pos_hits > neg_hits:
            sentiments.append("positive")
        elif neg_hits > pos_hits:
            sentiments.append("negative")
        else:
            sentiments.append("neutral")

    if len(sentiments) >= 3 and len(set(sentiments)) == 1:
        flags.append({
            "type": "uniform_sentiment",
            "severity": "medium",
            "detail": f"All {len(sentiments)} reviews have identical sentiment: {sentiments[0]}"
        })
        details["uniform_sentiment"] = sentiments[0]

    # ── Final verdict ─────────────────────────────────────────────────────────
    high_flags = sum(1 for f in flags if f["severity"] == "high")
    med_flags  = sum(1 for f in flags if f["severity"] == "medium")

    bot_score = min((high_flags * 0.40 + med_flags * 0.20), 1.0)
    is_bot = bot_score >= 0.40 or high_flags >= 1

    return {
        "is_bot": is_bot,
        "bot_score": round(bot_score, 4),
        "confidence": round(bot_score if is_bot else 1 - bot_score, 4),
        "flags": flags,
        "details": details,
    }
