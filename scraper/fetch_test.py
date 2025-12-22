import requests
import json
import time
import os

BASE_URL = "https://thesession.org"
TUNE_TYPES = ["jig", "reel"]
TUNES_PER_TYPE = 2
DELAY = 1.0

def fetch_popular_tunes(tune_type, count=2):
    tunes = []
    page = 1
    per_page = 50
    print(f"Fetching {tune_type} - page {page}...")
    url = f"{BASE_URL}/tunes/search?type={tune_type}&sort=popular&format=json&perpage={per_page}&page={page}"
    response = requests.get(url)
    if response.status_code != 200:
        return []
    data = response.json()
    return data.get("tunes", [])[:count]

def fetch_tune_details(tune_id):
    print(f"Fetching details for tune {tune_id}...")
    url = f"{BASE_URL}/tunes/{tune_id}?format=json"
    response = requests.get(url)
    if response.status_code != 200:
        return None
    return response.json()

def main():
    all_tunes_data = []
    if not os.path.exists("public"):
        os.makedirs("public")

    for tune_type in TUNE_TYPES:
        popular_tunes = fetch_popular_tunes(tune_type, TUNES_PER_TYPE)
        for tune in popular_tunes:
            details = fetch_tune_details(tune["id"])
            if details:
                abc = details["settings"][0]["abc"] if details.get("settings") else ""
                all_tunes_data.append({
                    "id": tune["id"],
                    "name": details.get("name"),
                    "type": details.get("type"),
                    "abc": abc,
                    "aliases": details.get("aliases", [])
                })
            time.sleep(DELAY)

    with open("public/tunes.json", "w") as f:
        json.dump(all_tunes_data, f, indent=4)
    print(f"Finished test fetch! {len(all_tunes_data)} tunes saved.")

if __name__ == "__main__":
    main()
