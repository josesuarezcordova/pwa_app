from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:9000"}}) # Enable CORS for all routes

# Load the trained model and label encoder
model = joblib.load("../models/feedback_model.pkl")
encoder = joblib.load("../models/label_encoder.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Log the incoming request data
        print("Incoming request data:", request.json)
        data = request.json
        new_features = np.array(data['features']).reshape(1, -1)
        
        # Log the reshaped features
        print("Reshaped features:", new_features)
        prediction = model.predict(new_features)
        decoded_label = encoder.inverse_transform(prediction)
        
        # Log the prediction result
        print("Prediction result:", decoded_label)
        return jsonify({'label': decoded_label[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:9000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
    
if __name__ == '__main__':
    app.run(debug=True)