from pymongo import MongoClient
import pprint

client = MongoClient("mongodb://localhost:27017/")
db = client.realifylens

all_records = list(db.analyses.find())
print(f"Total records in DB: {len(all_records)}")
for record in all_records[-5:]:
    print(record['original_filename'])
    print(record['ai_result'])
    print("---")
