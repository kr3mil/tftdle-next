import urllib.request
import json
import os
import shutil

f = open('all_champs.json')

data = json.load(f)

for champ in data:
  print(f"Getting {champ['name']}")
  champ_url = champ['name'].lower().replace(' ', '-').replace("'", '').replace('.', '')
  url = f"https://cdn.mobalytics.gg/assets/tft/images/champions/icons/set{champ['set']}/{champ_url}.png"
  target_path = f"icons/{champ['set']}/{champ_url}.png"

  if os.path.exists(target_path):
    print(f"Champ icon already exists, skipping...")
    continue

  os.makedirs(os.path.dirname(target_path), exist_ok=True)

  failed = False

  try:
    urllib.request.urlretrieve(url, target_path)
  except:
    failed = True
    pass

  if failed:
    champ_url = champ['name'].lower().replace(' ', '').replace("'", '').replace('.', '')
    url = f"https://cdn.mobalytics.gg/assets/tft/images/champions/icons/set{champ['set']}/{champ_url}.png"
    urllib.request.urlretrieve(url, target_path)

  champ['icon'] = target_path

with open("all_champs_new.json", "w", encoding="utf-8") as f:
  json.dump(data, f, ensure_ascii=False, indent=4)