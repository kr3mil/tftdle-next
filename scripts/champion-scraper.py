import requests
import json
from bs4 import BeautifulSoup

sets = ["1", "2", "3", "4", "4-5", "5", "5-5", "6", "6-5", "7", "7-5"]
json_all = {}

for set in sets:
  print(f"Grabbing set: {set}")

  url_all_champs = f"https://app.mobalytics.gg/tft/set{set}/champions"
  page_all_champs = requests.get(url_all_champs)
  soup_all_champs = BeautifulSoup(page_all_champs.content, "html.parser")

  champs = soup_all_champs.find(class_="m-1o47yso")

  json_champs = []

  for champ in champs:
    print(f"Grabbing champ: {champ['href'].split('/')[-1]}")
    json_champ = {}

    url_champ = champ["href"]
    url_champ = f"https://app.mobalytics.gg{url_champ}"

    page_champ = requests.get(url_champ)
    soup_champ = BeautifulSoup(page_champ.content, "html.parser")

    traits = []
    trait_elements = soup_champ.find_all("div", class_="m-yrtm36")
    for trait_element in trait_elements:
      traits.append(trait_element.text)

    json_champ["name"] = soup_champ.find("h1", class_="m-1iy9fzd").text
    json_champ["cost"] = soup_champ.find("div", class_="m-1sg2lsz").text

    stats_parent_element = soup_champ.find("div", class_="m-mt7fya")
    stats_elements = stats_parent_element.find_all("div")
    for stat_element in stats_elements:
      stat_text_element = stat_element.find("p")

      if not stat_text_element:
        continue

      stat_text = stat_text_element.text

      match stat_text:
        case "Health":
          stat_health = stat_element.find("p", class_="m-i2q2ze").text
          json_champ["health"] = stat_health
        case "Range":
          stat_range = stat_element.find("svg")["value"]
          json_champ["range"] = stat_range

    json_champ["traits"] = traits

    json_champs.append(json_champ)
  
  json_all[set] = json_champs

with open("champs.json", "w", encoding="utf-8") as f:
  json.dump(json_all, f, ensure_ascii=False, indent=4)