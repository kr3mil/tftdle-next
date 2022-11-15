import json

f = open("json\\all_champs.json")

data = json.load(f)

for entry in data:
  champ = entry['name']
  gender = input(f'Gender of {champ}: ')
  if gender == '1':
    gender = 'Male'
  elif gender == '2':
    gender = 'Female'
  elif gender == '3':
    gender = 'Other'

  entry['gender'] = gender

with open("champs_new.json", "w", encoding="utf-8") as f:
  json.dump(data, f, ensure_ascii=False, indent=4)