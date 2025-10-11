import joblib
import json
import numpy as np
from pathlib import Path

# Resolve the base directory (two levels up from this file)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the trained model
model = joblib.load(BASE_DIR / "models/feedback_model.pkl")

# Load the label encoder
encoder = joblib.load(BASE_DIR / "models/label_encoder.pkl")

with open(BASE_DIR / "data/new_features.json", "r") as f:
    new_features = json.load(f)

new_features = np.array(new_features).reshape(1, -1)

# Example feature values
prediction = model.predict(new_features)

# Decode the predicted class
decode_label = encoder.inverse_transform(prediction)

print("Predicted class:", prediction[0])
print("Decoded label:", decode_label[0])