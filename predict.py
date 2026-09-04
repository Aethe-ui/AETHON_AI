import joblib


# Load the saved vectorizer and model
vectorizer = joblib.load("models/tfidf_vectorizer.joblib")
model = joblib.load("models/text_classifier.joblib")


# Get email input from the user
subject = input("Enter email subject: ")
body = input("Enter email body: ")


# Combine subject and body
text = subject + " " + body


# Convert text into TF-IDF features
text_tfidf = vectorizer.transform([text])


# Make prediction
prediction = model.predict(text_tfidf)[0]

# Get probability for each class
probabilities = model.predict_proba(text_tfidf)[0]


# Display result
if prediction == 1:
    print("\nPrediction: PHISHING")
else:
    print("\nPrediction: LEGITIMATE")


print(f"Phishing probability: {probabilities[1]:.4f}")
print(f"Legitimate probability: {probabilities[0]:.4f}")