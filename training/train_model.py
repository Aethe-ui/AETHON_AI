import pandas as pd
# pyrefly: ignore [missing-import]
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
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


# 5. Build ML pipeline
# TF-IDF is fitted separately inside each cross-validation fold.
pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
            max_features=10000,
            min_df=2
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            random_state=42
        )
    )
])


# 6. 5-fold stratified cross-validation
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_results = cross_validate(
    pipeline,
    X_train,
    y_train,
    cv=cv,
    scoring=[
        "accuracy",
        "precision",
        "recall",
        "f1"
    ]
)


print("\n===== 5-FOLD CROSS-VALIDATION =====")

for metric in ["accuracy", "precision", "recall", "f1"]:
    scores = cv_results[f"test_{metric}"]

    print(
        f"{metric.capitalize():9s}: "
        f"{scores.mean():.4f} ± {scores.std():.4f}"
    )


# 7. Train final model on complete training set
pipeline.fit(X_train, y_train)


# 8. Make predictions on untouched test set
y_pred = pipeline.predict(X_test)


# 9. Evaluate final model
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\n===== FINAL MODEL EVALUATION =====")
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


# 10. Save TF-IDF vectorizer and model separately
vectorizer = pipeline.named_steps["tfidf"]
model = pipeline.named_steps["classifier"]

MODEL_PATH = "models/text_classifier.joblib"
VECTORIZER_PATH = "models/tfidf_vectorizer.joblib"

joblib.dump(model, MODEL_PATH)
joblib.dump(vectorizer, VECTORIZER_PATH)


print("\n===== SAVED =====")
print(f"Model     : {MODEL_PATH}")
print(f"Vectorizer: {VECTORIZER_PATH}")