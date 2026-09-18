import os
import re
import urllib.request
from pathlib import Path

SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

# Regex to find paths starting with /cdn-proxy/
pattern = r'/cdn-proxy/[^\s"\'>]+'

links = set()
for html_file in Path(SITE_DIR).glob('*.html'):
    content = html_file.read_text(encoding='utf-8', errors='ignore')
    matches = re.findall(pattern, content)
    for match in matches:
        # Clean trailing characters like ); or " or '
        cleaned = re.split(r'[)\s"\'>;]', match)[0]
        # Convert to absolute URL
        path = cleaned[11:] # remove /cdn-proxy/
        if 'thumbnail' in path or 'upload' in path:
            links.add(f"https://vendor-cdn.imweb.me/{path}")
        else:
            links.add(f"https://static.imweb.me/{path}")

print(f"Found {len(links)} assets to download.")

os.makedirs(ASSETS_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://affinityuniverse.com/',
}

success_count = 0
fail_count = 0

for url in links:
    try:
        # Determine local path
        if 'vendor-cdn.imweb.me' in url:
            path = url.split('vendor-cdn.imweb.me/')[-1]
        elif 'static.imweb.me' in url:
            path = url.split('static.imweb.me/')[-1]
        else:
            path = os.path.basename(url)

        local_path = os.path.join(ASSETS_DIR, path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        success_count += 1
        if success_count % 100 == 0:
            print(f"Downloaded {success_count} assets...")
    except Exception as e:
        fail_count += 1

print(f"Finished. Success: {success_count}, Fail: {fail_count}")
