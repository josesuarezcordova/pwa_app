from load_data import load_data
from clean_data import clean_data
from preprocess_data import preprocess_data
from split_data import split_data
from train_model import train_model
from evaluate_model import evaluate_model
from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib
from collections import Counter
from sklearn.metrics import classification_report, confusion_matrix

# Load data
data = load_data('feedbackData.json')

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

joblib.dump(clf, 'feedback_model.pkl')

# Encode labels and save the encoder
labels = [record["userLabel"] for record in cleaned_data]
encoder = LabelEncoder()
encoded_labels = encoder.fit_transform(labels)

# Save the LabelEncoder
joblib.dump(encoder, "label_encoder.pkl")

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