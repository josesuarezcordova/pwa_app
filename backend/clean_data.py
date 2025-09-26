def clean_data(data):
    return [
        record for record in data 
        if "features" in record and "userLabel" in record and record["features"] is not None and record["userLabel"] is not None
    ]