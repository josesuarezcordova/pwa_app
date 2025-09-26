from sklearn.model_selection import train_test_split

def split_data(data):
    features = [record["normalizedFeatures"] for record in data]
    labels = [record["encodedLabel"] for record in data]

    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test