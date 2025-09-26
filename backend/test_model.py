import joblib
import json
import numpy as np

# Load the trained model
model = joblib.load("feedback_model.pkl")

# Load the label encoder
encoder = joblib.load("label_encoder.pkl")

with open("new_features.json", "r") as f:
    new_features = json.load(f)

new_features = np.array(new_features).reshape(1, -1)

# Example feature values
prediction = model.predict(new_features)

# Decode the predicted class
decode_label = encoder.inverse_transform(prediction)

print("Predicted class:", prediction[0])
print("Decoded label:", decode_label[0])