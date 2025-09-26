import json

# Load the JSON file
with open("feedbackData.json", "r") as file:
    data = json.load(file)

# Use the features from the first record
new_features = data[0]["features"]

with open("new_features.json", "w") as file:
    json.dump(new_features, file, indent=4)
    
print("New features saved to new_features.json")