import json
import random

# Load the JSON file
with open("data/feedbackData.json", "r") as file:
    data = json.load(file)

if len(data) == 0:
    print("No data found in feedbackData.json")
    exit()

# Select a random record from the data
random_entry = random.choice(data)

# Use the features from the first record
new_features = random_entry["features"]

with open("data/new_features.json", "w") as file:
    json.dump(new_features, file, indent=4)
    
print("New features saved to new_features.json")