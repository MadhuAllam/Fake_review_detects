import os
import sys
import pandas as pd
import numpy as np
import joblib
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Download NLTK data
nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)
nltk.download("wordnet", quiet=True)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.services.preprocessor import clean_text

# ─── Configuration ────────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_reviews.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def load_data():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["review_text", "label"])
    df["label_binary"] = (df["label"] == "fake").astype(int)
    return df

def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            class_weight="balanced",
        )),
    ])

def train():
    print("📂 Loading dataset...")
    df = load_data()
    print(f"   Total samples: {len(df)} | Fake: {df['label_binary'].sum()} | Real: {(df['label_binary']==0).sum()}")

    # Preprocess text
    print("🔤 Preprocessing text...")
    df["clean_text"] = df["review_text"].apply(clean_text)

    X = df["clean_text"]
    y = df["label_binary"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🤖 Training TF-IDF + Logistic Regression pipeline...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.4f}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Real", "Fake"]))

    # Save model
    model_path = os.path.join(MODEL_DIR, "fake_review_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"\n💾 Model saved to: {model_path}")

    # Save vectorizer separately for bot detection embeddings
    vectorizer_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
    joblib.dump(pipeline.named_steps["tfidf"], vectorizer_path)
    print(f"💾 Vectorizer saved to: {vectorizer_path}")

    return pipeline

if __name__ == "__main__":
    train()
