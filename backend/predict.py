def predict(clf, encoder, new_features):
    prediction = clf.predict([new_features])
    return encoder.inverse_transform(prediction)