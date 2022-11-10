import requests
from bs4 import BeautifulSoup
import os
import urllib.request

sets = ["1", "2", "3", "4", "4-5", "5", "5-5", "6", "6-5", "7", "7-5"]
json_all = {}

for set in sets:
  print(f"Grabbing set: {set}")

  url_all_classes = f"https://app.mobalytics.gg/tft/set{set}/synergies/classes"
  url_all_origins = f"https://app.mobalytics.gg/tft/set{set}/synergies/origins"
  page_all_classes = requests.get(url_all_classes)
  page_all_origins = requests.get(url_all_origins)
  soup_all_classes = BeautifulSoup(page_all_classes.content, "html.parser")
  soup_all_origins = BeautifulSoup(page_all_origins.content, "html.parser")

  icons_classes = soup_all_classes.find_all("img", class_="m-8k2h0n")
  icons_origins = soup_all_origins.find_all("img", class_="m-8k2h0n")

  for icon in icons_classes:
    name = icon['alt']

    print(f"Grabbing icon: {name}")

    src = icon['src']
    set = src.split('tft-synergies-set')[1].split('/')[0]
    
    target_path = f"icons/{set}/traits/{name}.svg"

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    urllib.request.urlretrieve(src, target_path)
  
  for icon in icons_origins:
    name = icon['alt']

    print(f"Grabbing icon: {name}")

    src = icon['src']
    set = src.split('tft-synergies-set')[1].split('/')[0]
    
    target_path = f"icons/{set}/traits/{name}.svg"

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    urllib.request.urlretrieve(src, target_path)