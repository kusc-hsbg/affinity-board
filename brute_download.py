import os
import urllib.request

def try_download(url, local_path, headers):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        return True
    except:
        return False

urls = [
    "https://vendor-cdn.imweb.me/thumbnail/20230511/ecde84ca9b797.png"
]

header_sets = [
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Referer": "https://affinityuniverse.com/"},
    {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1", "Referer": "https://affinityuniverse.com/"},
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}, # No referer
    {"User-Agent": "Mozilla/5.0", "Referer": ""},
]

for url in urls:
    for i, headers in enumerate(header_sets):
        local_path = "test_" + str(i) + ".png"
        if try_download(url, local_path, headers):
            print(f"Success with header set {i}!")
            break
        else:
            print(f"Failed with header set {i}")
