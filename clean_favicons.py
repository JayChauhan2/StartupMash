import json
import urllib.request
import concurrent.futures
from urllib.parse import urlparse
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

with open("src/data.json", "r") as f:
    startups = json.load(f)

print(f"Total startups loaded: {len(startups)}")

def process_startup(startup):
    website = startup.get("website")
    if not website:
        return None
    
    try:
        url_string = website if website.startswith("http") else f"https://{website}"
        hostname = urlparse(url_string).hostname
        if not hostname:
            return None
            
        favicon_url = f"https://www.google.com/s2/favicons?domain={hostname}&sz=128"
        
        req = urllib.request.Request(favicon_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                return startup
        return None
    except Exception:
        return None

valid_startups = []
count = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    results = executor.map(process_startup, startups)
    for res in results:
        count += 1
        if count % 500 == 0:
            print(f"Processed {count}/{len(startups)}...")
        if res:
            valid_startups.append(res)

print(f"Total valid startups after filtering: {len(valid_startups)}")

with open("src/data.json", "w") as f:
    json.dump(valid_startups, f)
    
print("Saved filtered data.json")
