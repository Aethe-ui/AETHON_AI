

# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
# pyrefly: ignore [missing-import]
import joblib
from database import save_scan

app = Flask(__name__)

# Load trained ML model and TF-IDF vectorizer
vectorizer = joblib.load("models/tfidf_vectorizer.joblib")
model = joblib.load("models/text_classifier.joblib")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "AETHON AI backend is running"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    subject = data.get("subject", "")
    body = data.get("body", "")

    if not subject and not body:
        return jsonify({"error": "Subject or body is required"}), 400

    # Combine subject and body
    text = subject + " " + body

    # Transform email text using the trained TF-IDF vectorizer
    text_tfidf = vectorizer.transform([text])

    # Make prediction
    prediction = int(model.predict(text_tfidf)[0])
    probabilities = model.predict_proba(text_tfidf)[0]

    phishing_probability = float(probabilities[1])

    if prediction == 1:
        label = "PHISHING"
    else:
        label = "LEGITIMATE"

    # Save scan result to Supabase
    save_scan(
        subject,
        body,
        label,
        phishing_probability
    )

    return jsonify({
        "prediction": label,
        "phishing_probability": phishing_probability,
        "legitimate_probability": float(probabilities[0])
    })


if __name__ == "__main__":
    app.run(debug=True)