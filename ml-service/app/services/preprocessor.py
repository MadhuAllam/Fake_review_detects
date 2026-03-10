from __future__ import annotations
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure NLTK assets are available
for resource in ["stopwords", "punkt", "wordnet", "omw-1.4"]:
    try:
        nltk.data.find(f"corpora/{resource}")
    except LookupError:
        nltk.download(resource, quiet=True)

_stop_words = set(stopwords.words("english"))
_lemmatizer = WordNetLemmatizer()

# Spam / suspicious signal words
SPAM_KEYWORDS = {
    "amazing", "incredible", "perfect", "must buy", "buy now",
    "highly recommend", "best ever", "life changing", "do not buy",
    "total scam", "worst ever", "avoid", "terrible", "garbage",
    "changed my life", "miracle", "fake", "fraud", "scam",
    "immediately", "everyone", "purchase now",
}

def clean_text(text: str) -> str:
    """Full NLP preprocessing pipeline."""
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)          # remove URLs
    text = re.sub(r"[^a-z\s]", " ", text)               # keep letters only
    text = re.sub(r"\s+", " ", text).strip()             # collapse whitespace
    tokens = text.split()
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 2]
    tokens = [_lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)

def highlight_suspicious_words(text: str) -> list[dict]:
    """
    Returns a list of tokens with a flag indicating whether each word
    is a known spam/suspicious signal.
    """
    words = text.split()
    result = []
    text_lower = text.lower()
    for word in words:
        clean = re.sub(r"[^a-z ]", "", word.lower())
        is_spam = clean in SPAM_KEYWORDS or any(kw in text_lower for kw in SPAM_KEYWORDS if " " in kw)
        result.append({"word": word, "suspicious": is_spam})
    return result

def extract_text_features(text: str) -> dict:
    """Extract numeric features from raw review text."""
    words = text.split()
    exclamation_count = text.count("!")
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    unique_words = len(set(w.lower() for w in words))
    vocab_diversity = unique_words / max(len(words), 1)

    return {
        "word_count": len(words),
        "char_count": len(text),
        "exclamation_count": exclamation_count,
        "caps_ratio": round(caps_ratio, 4),
        "vocab_diversity": round(vocab_diversity, 4),
        "avg_word_length": round(sum(len(w) for w in words) / max(len(words), 1), 2),
    }
