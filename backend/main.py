from scripts.load_data import load_data
from scripts.clean_data import clean_data
from scripts.preprocess_data import preprocess_data
from scripts.split_data import split_data
from scripts.train_model import train_model
from scripts.evaluate_model import evaluate_model

from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib
from collections import Counter
from sklearn.metrics import classification_report, confusion_matrix
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


# Load data
data = load_data('data/feedbackData.json')

# Clean data
cleaned_data = clean_data(data)

# Preprocess data
preprocessed_data, encoder = preprocess_data(cleaned_data)

# Split data
X_train, X_test, y_train, y_test = split_data(preprocessed_data)

#Remove records with missing values
X_train = np.array(X_train)
y_train = np.array(y_train)

# Filter out rows with NaN values
valid_indices = ~np.isnan(X_train).any(axis=1)
X_train = X_train[valid_indices]
y_train = y_train[valid_indices]

print("X_train shape:", X_train.shape)
print("y_train shape:", y_train.shape)
print("Any NaN in X_train:", np.isnan(X_train).any())
print("Any NaN in y_train:", np.isnan(y_train).any())


# Train model
clf = train_model(X_train, y_train)

joblib.dump(clf, MODELS_DIR / 'feedback_model.pkl')
print("Saved model to:", MODELS_DIR / "feedback_model.pkl")

# Encode labels and save the encoder
labels = [record["userLabel"] for record in cleaned_data]
encoder = LabelEncoder()
encoded_labels = encoder.fit_transform(labels)

# IMPORTANT: save the SAME encoder produced by preprocess_data
# Remove the re-fit block to avoid mismatches:
# labels = [record["userLabel"] for record in cleaned_data]
# encoder = LabelEncoder()
# encoded_labels = encoder.fit_transform(labels)

# Save the LabelEncoder
joblib.dump(encoder, MODELS_DIR / "label_encoder.pkl")
print("Saved encoder to:", MODELS_DIR / "label_encoder.pkl")
print("Encoder classes:", list(encoder.classes_))

# Count the occurrences of each label
label_counts = Counter(labels)
print("Label distribution:", label_counts)

# Evaluate the model on the test set
y_pred = clf.predict(X_test)

# Confusion matrix
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Classification report
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Evaluate model
evaluate_model(clf, X_test, y_test)