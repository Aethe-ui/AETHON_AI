from pathlib import Path

import joblib


BASE_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BASE_DIR.parent / "models"

MODEL_PATH = MODELS_DIR / "text_classifier.joblib"
VECTORIZER_PATH = MODELS_DIR / "tfidf_vectorizer.joblib"


class MLService:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"ML model not found: {MODEL_PATH}"
            )

        if not VECTORIZER_PATH.exists():
            raise FileNotFoundError(
                f"TF-IDF vectorizer not found: {VECTORIZER_PATH}"
            )

        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)

    def predict(
        self,
        subject: str | None,
        body: str | None,
    ) -> dict:
        subject = subject or ""
        body = body or ""

        text = f"{subject} {body}".strip()

        if not text:
            return {
                "classification": "unknown",
                "confidence": 0.0,
                "is_malicious": None,
            }

        features = self.vectorizer.transform([text])

        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]

        confidence = float(max(probabilities))

        prediction_int = int(prediction)

        if prediction_int == 1:
            classification = "phishing"
            is_malicious = True
        else:
            classification = "legitimate"
            is_malicious = False

        return {
            "classification": classification,
            "confidence": confidence,
            "is_malicious": is_malicious,
        }


ml_service = MLService()