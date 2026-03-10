from textblob import TextBlob


def calculate_trust_score(metrics: dict) -> dict:
    """
    Calculate reviewer trust score using the weighted formula:
    Trust = 0.25 * authenticity + 0.20 * diversity + 0.20 * age_score
           + 0.20 * sentiment_consistency + 0.15 * behavioral_pattern
    """
    review_count      = metrics.get("review_count", 1)
    fake_count        = metrics.get("fake_count", 0)
    avg_review_length = metrics.get("avg_review_length", 50)
    unique_products   = metrics.get("unique_products", 1)
    account_age_days  = metrics.get("account_age_days", 30)
    avg_sentiment     = metrics.get("avg_sentiment", 0.5)        # 0-1
    sentiment_std     = metrics.get("sentiment_std", 0.2)        # lower = consistent
    burst_detected    = metrics.get("burst_detected", False)
    duplicate_ratio   = metrics.get("duplicate_ratio", 0.0)      # 0-1
    review_texts      = metrics.get("review_texts", [])

    # ── 1. Review Authenticity (0-100) ────────────────────────────────────────
    fake_ratio = fake_count / max(review_count, 1)
    authenticity = (1 - fake_ratio) * 100

    # ── 2. Review Diversity (0-100) ───────────────────────────────────────────
    diversity_by_products = min(unique_products / max(review_count, 1), 1.0) * 100
    diversity_by_vocab = _vocab_diversity_score(review_texts)
    diversity = (diversity_by_products * 0.5 + diversity_by_vocab * 0.5)

    # ── 3. Account Age Score (0-100) ──────────────────────────────────────────
    # Full score at 365 days
    age_score = min(account_age_days / 365, 1.0) * 100

    # ── 4. Sentiment Consistency (0-100) ──────────────────────────────────────
    # Low std → consistent → high score; high std → inconsistent → lower score
    consistency = max(0, (1 - sentiment_std / 0.5)) * 100

    # ── 5. Behavioral Pattern (0-100) ─────────────────────────────────────────
    behavior = 100.0
    if burst_detected:
        behavior -= 40
    behavior -= duplicate_ratio * 60
    behavior = max(behavior, 0)

    # ── Weighted Sum ──────────────────────────────────────────────────────────
    raw_score = (
        0.25 * authenticity +
        0.20 * diversity +
        0.20 * age_score +
        0.20 * consistency +
        0.15 * behavior
    )
    trust_score = round(min(max(raw_score, 0), 100), 2)

    # Category
    if trust_score >= 70:
        category = "trusted"
        label = "Trusted Reviewer"
    elif trust_score >= 40:
        category = "medium"
        label = "Medium Trust"
    else:
        category = "suspicious"
        label = "Suspicious"

    return {
        "trust_score": trust_score,
        "category": category,
        "label": label,
        "breakdown": {
            "authenticity": round(authenticity, 2),
            "diversity": round(diversity, 2),
            "age_score": round(age_score, 2),
            "sentiment_consistency": round(consistency, 2),
            "behavioral_pattern": round(behavior, 2),
        },
    }


def _vocab_diversity_score(texts: list) -> float:
    """Average vocabulary diversity across multiple reviews."""
    if not texts:
        return 50.0
    scores = []
    for t in texts:
        if not t:
            continue
        words = str(t).lower().split()
        if not words:
            continue
        scores.append(len(set(words)) / len(words) * 100)
    return sum(scores) / len(scores) if scores else 50.0
