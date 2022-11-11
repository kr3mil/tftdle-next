import json

f = open('champs.json')

data = json.load(f)

for key in data.keys():
  set = data[key]
  for champ in set:
    champ["set"] = key

with open("champs_new.json", "w", encoding="utf-8") as f:
  json.dump(data, f, ensure_ascii=False, indent=4)