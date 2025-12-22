import requests
import json
import difflib

def normalize(s):
    s = s.lower()
    if s.startswith("the "):
        s = s[4:]
    return "".join(c for c in s if c.isalnum() or c.isspace()).strip()

def are_similar(s1, s2, threshold=0.8):
    n1 = normalize(s1)
    n2 = normalize(s2)
    if not n1 or not n2:
        return False
    ratio = difflib.SequenceMatcher(None, n1, n2).ratio()
    if ratio > threshold:
        return True
    t1 = sorted(n1.split())
    t2 = sorted(n2.split())
    if t1 == t2 and t1:
        return True
    return False

def filter_aliases(main_name, aliases):
    filtered = []
    for alias in aliases:
        if are_similar(main_name, alias):
            continue
        is_redundant = False
        for f in filtered:
            if are_similar(f, alias):
                is_redundant = True
                break
        if not is_redundant:
            filtered.append(alias)
    return filtered

def test_alias_filtering():
    main_name = "Drowsy Maggie"
    raw_aliases = [
        "Drowsey Maggie",
        "Drowsie Maggie",
        "Drowsy Maggy",
        "Maggie Drowsy",
        "Maggie Tuirseach",
        "Maggie's Drowsy"
    ]
    filtered = filter_aliases(main_name, raw_aliases)
    print(f"Main: {main_name}")
    print(f"Raw: {raw_aliases}")
    print(f"Filtered: {filtered}")

if __name__ == "__main__":
    test_alias_filtering()
    # Also fetch real data for tune 27
    url = "https://thesession.org/tunes/27?format=json"
    data = requests.get(url).json()
    main_name = data.get("name")
    raw_aliases = data.get("aliases", [])
    filtered = filter_aliases(main_name, raw_aliases)
    print(f"\nReal Tune 27 ({main_name}):")
    print(f"Raw Aliases: {raw_aliases}")
    print(f"Filtered Aliases: {filtered}")
    print(f"Tunebooks: {data.get('tunebooks')}")
    print(f"Key: {data['settings'][0]['key'] if data.get('settings') else 'N/A'}")
