import json
import random
from pathlib import Path

file_path = Path(__file__).resolve().parent.parent / "data/feedbackData.json"

print(file_path)
# Load the JSON file
with open(file_path, "r") as file:
    data = json.load(file)

if len(data) == 0:
    print("No data found in feedbackData.json")
    exit()

# Select a random record from the data
random_entry = random.choice(data)

# Use the features from the first record
new_features = random_entry["features"]

output_path = Path(__file__).resolve().parent.parent / "data/new_features.json"
with open(output_path, "w") as file:
    json.dump(new_features, file, indent=4)
    
print("New features saved to new_features.json")