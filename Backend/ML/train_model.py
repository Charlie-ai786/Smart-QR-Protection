import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle

# Sample dataset (you can expand later)
data = {
    "text": [
        "https://google.com",
        "https://amazon.in",
        "https://github.com",
        "http://login-bank.com/verify",
        "http://secure-update-account.com",
        "http://192.168.0.1/login",
        "upi://pay?pa=user@upi&pn=User&am=100",
        "free-money-login-now",
        "verify-your-bank-account",
        "secure-payment-update",
        "randomstring123456789",
    ],
    "label": [
        "safe",
        "safe",
        "safe",
        "malicious",
        "malicious",
        "malicious",
        "safe",
        "suspicious",
        "malicious",
        "suspicious",
        "suspicious",
    ]
}

df = pd.DataFrame(data)

# Convert text → features
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])

# Train model
model = LogisticRegression()
model.fit(X, df["label"])

# Save model + vectorizer
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✅ Model trained & saved")