import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


# 1. Load dataset
DATA_PATH = "data/synthetic_emails.csv"

df = pd.read_csv(DATA_PATH)

print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")


# 2. Combine subject and body
df["text"] = (
    df["subject"].fillna("").astype(str)
    + " "
    + df["body"].fillna("").astype(str)
)


# 3. Convert labels to numbers
# phishing = 1
# legitimate = 0
df["label_encoded"] = df["label"].map({
    "phishing": 1,
    "legitimate": 0
})


# Check for unexpected labels
if df["label_encoded"].isna().any():
    raise ValueError("Dataset contains an unknown label.")


X = df["text"]
y = df["label_encoded"]


# 4. Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# 5. Convert text into TF-IDF features
vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    max_features=10000,
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)


print(f"TF-IDF training shape: {X_train_tfidf.shape}")


# 6. Train Logistic Regression model
model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

model.fit(X_train_tfidf, y_train)


# 7. Make predictions
y_pred = model.predict(X_test_tfidf)


# 8. Evaluate model
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\n===== MODEL EVALUATION =====")
print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")

print("\n===== CONFUSION MATRIX =====")
print(confusion_matrix(y_test, y_pred))

print("\n===== CLASSIFICATION REPORT =====")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["legitimate", "phishing"]
    )
)


# 9. Save model and vectorizer
MODEL_PATH = "models/text_classifier.joblib"
VECTORIZER_PATH = "models/tfidf_vectorizer.joblib"

joblib.dump(model, MODEL_PATH)
joblib.dump(vectorizer, VECTORIZER_PATH)

print("\n===== SAVED =====")
print(f"Model     : {MODEL_PATH}")
print(f"Vectorizer: {VECTORIZER_PATH}")