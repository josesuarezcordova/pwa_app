from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from pathlib import Path

ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    "http://localhost:9001",
    "http://127.0.0.1:9001",
    "https://josesuarezcordova.github.io",  # GitHub Pages URL
    "http://localhost:3000",
    "http://192.168.1.101:3000",
    "https://api.jsdevcloud.uk", 
]


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS, "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Load the trained model and label encoder using file-relative paths
BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"
model = joblib.load(MODELS_DIR / "feedback_model.pkl")
encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Explicitly handle preflight request
        response = jsonify({"message": "CORS preflight"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 204
        return ("", 204)
    try:
        # Log the incoming request data
        print("Incoming request data:", request.json)
        data = request.get_json(force=True)
        new_features = np.array(data['features']).reshape(1, -1)
        
        # Log the reshaped features
        print("Reshaped features:", new_features)
        prediction = model.predict(new_features)
        decoded_label = encoder.inverse_transform(prediction)
        
        # Log the prediction result
        print("Prediction result:", decoded_label)
        response = jsonify({'label': decoded_label[0]})
        response.headers.add("Access-Control-Allow-Origin", "*")  # Add CORS header to response
        return response
    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")  # Add CORS header to error response
        return response, 500
    
if __name__ == '__main__':
    app.run(debug=True)