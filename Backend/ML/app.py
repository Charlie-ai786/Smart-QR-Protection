from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load model + vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

@app.route("/")
def home():
    return "ML API Running 🚀"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        qr_data = data.get("qr_data")

        if not qr_data:
            return jsonify({"error": "No qr_data provided"}), 400

        # Transform input
        X = vectorizer.transform([qr_data])

        # Predict
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        confidence = float(max(probabilities))

        return jsonify({
            "ml": {
                "prediction": prediction,
                "confidence": round(confidence, 2)
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)