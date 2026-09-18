import urllib.request
import os

url = "https://vendor-cdn.imweb.me/thumbnail/20240205/677d42183314d.png"
agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
]

for agent in agents:
    headers = {
        "User-Agent": agent,
        "Referer": "https://affinityuniverse.com/",
        "Accept": "image/avif,image/webp,image/*;q=0.8",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Success with agent: {agent}")
            break
    except Exception as e:
        print(f"Failed with agent {agent[:20]}... : {e}")
