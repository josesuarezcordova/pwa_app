from sklearn.preprocessing import LabelEncoder
import numpy as np

def preprocess_data(data):
    # Encode labels
    labels = [record["userLabel"] for record in data]
    encoder = LabelEncoder()
    encoded_labels = encoder.fit_transform(labels)

    #Normalize features
    for i, record in enumerate(data):
        features = np.array(record["features"])
        feature_range = features.max() - features.min()
        if feature_range == 0:
            record["normalizedFeatures"] = np.zeros_like(features)
        else:
            record["normalizedFeatures"] = (features - features.min()) / (features.max() - features.min())
        record["encodedLabel"] = int(encoded_labels[i])

    return data, encoder