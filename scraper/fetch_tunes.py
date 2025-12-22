import requests
import json
import time
import os
import difflib

BASE_URL = "https://thesession.org"
TOTAL_TUNES = 1500
DELAY = 1.0  # 1 second delay between requests

def normalize(s):
    """Lowercase, strip 'the', and remove punctuation."""
    s = s.lower()
    if s.startswith("the "):
        s = s[4:]
    return "".join(c for c in s if c.isalnum() or c.isspace()).strip()

def are_similar(s1, s2, threshold=0.8):
    """Check if two strings are similar by ratio or token rearrangement."""
    n1 = normalize(s1)
    n2 = normalize(s2)
    if not n1 or not n2:
        return False
    # Similarity ratio
    ratio = difflib.SequenceMatcher(None, n1, n2).ratio()
    if ratio > threshold:
        return True
    # Token-based check for rearrangements (e.g., "Maggie Drowsy" vs "Drowsy Maggie")
    t1 = sorted(n1.split())
    t2 = sorted(n2.split())
    if t1 == t2 and t1:
        return True
    return False

def filter_aliases(main_name, aliases):
    """Remove aliases similar to main name or each other."""
    filtered = []
    for alias in aliases:
        # Check against main name
        if are_similar(main_name, alias):
            continue
        # Check against existing filtered aliases
        is_redundant = False
        for f in filtered:
            if are_similar(f, alias):
                is_redundant = True
                break
        if not is_redundant:
            filtered.append(alias)
    return filtered

def fetch_popular_tunes(count=1500):
    tunes = []
    page = 1
    per_page = 50
    while len(tunes) < count:
        print(f"Fetching global top tunes - page {page}...")
        # Search without a type to get global popularity
        url = f"{BASE_URL}/tunes/search?sort=popular&format=json&perpage={per_page}&page={page}"
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Error fetching page {page}: {response.status_code}")
                break
            
            data = response.json()
            new_tunes = data.get("tunes", [])
            if not new_tunes:
                break
                
            tunes.extend(new_tunes)
            page += 1
        except Exception as e:
            print(f"Request failed: {e}")
            break
            
        time.sleep(DELAY)
        
    return tunes[:count]

def fetch_tune_details(tune_id):
    print(f"Fetching details for tune {tune_id}...")
    url = f"{BASE_URL}/tunes/{tune_id}?format=json"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error fetching tune {tune_id}: {response.status_code}")
            return None
        return response.json()
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def main():
    all_tunes_data = []
    
    # Ensure public directory exists
    if not os.path.exists("public"):
        os.makedirs("public")

    print(f"\nFetching top {TOTAL_TUNES} tunes globally...")
    popular_tunes = fetch_popular_tunes(TOTAL_TUNES)
    
    for i, tune in enumerate(popular_tunes):
        tune_id = tune["id"]
        print(f"\n[{i+1}/{TOTAL_TUNES}] Processing tune: {tune.get('name')} (ID: {tune_id})")
        
        details = fetch_tune_details(tune_id)
        if details:
            # Get ABC and Key from first setting
            abc = ""
            key = ""
            if details.get("settings"):
                abc = details["settings"][0].get("abc", "")
                key = details["settings"][0].get("key", "")
            
            main_name = details.get("name", "")
            raw_aliases = details.get("aliases", [])
            aliases = filter_aliases(main_name, raw_aliases)
            
            tune_info = {
                "id": tune_id,
                "name": main_name,
                "type": details.get("type"),
                "abc": abc,
                "key": key,
                "tunebooks": details.get("tunebooks", 0),
                "aliases": aliases
            }
            all_tunes_data.append(tune_info)
            
            # Save progress periodically
            if len(all_tunes_data) % 10 == 0:
                with open("public/tunes.json", "w") as f:
                    json.dump(all_tunes_data, f, indent=4)
        
        time.sleep(DELAY)

    # Final save
    with open("public/tunes.json", "w") as f:
        json.dump(all_tunes_data, f, indent=4)
    
    print(f"\nFinished! Total tunes fetched: {len(all_tunes_data)}")

if __name__ == "__main__":
    main()
