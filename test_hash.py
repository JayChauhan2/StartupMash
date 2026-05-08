import urllib.request
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
GENERIC_URL = "https://www.google.com/s2/favicons?domain=stripe.com&sz=128"
try:
    req = urllib.request.Request(GENERIC_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
        print(response.status)
        data = response.read()
        print("Length:", len(data))
except Exception as e:
    print(e)
