import os
import re
import urllib.request
from pathlib import Path

SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

def get_all_assets():
    assets = set()
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        # Find everything that looks like a path to an asset
        matches = re.findall(r'src="(/assets/[^"]+)"', content)
        matches += re.findall(r'href="(/assets/[^"]+)"', content)
        for m in matches:
            assets.add(m)
    return assets

def download_asset(local_path):
    # Convert /assets/thumbnail/... to https://vendor-cdn.imweb.me/thumbnail/...
    path = local_path[8:] # remove /assets/
    if 'thumbnail' in path or 'upload' in path:
        url = f"https://vendor-cdn.imweb.me/{path}"
    elif 'static.imweb.me' in path:
        url = f"https://static.imweb.me/{path.replace('static.imweb.me/', '')}"
    else:
        url = f"https://static.imweb.me/{path}"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://affinityuniverse.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(os.path.join('public', local_path), 'wb') as f:
                f.write(response.read())
        return True
    except Exception:
        return False

if __name__ == '__main__':
    assets = get_all_assets()
    print(f"Found {len(assets)} assets to verify/download.")
    
    success = 0
    fail = 0
    for asset in assets:
        local_path = os.path.join('public', asset)
        if not os.path.exists(local_path):
            if download_asset(asset):
                success += 1
            else:
                fail += 1
    
    print(f"Downloaded {success} new assets, failed {fail}.")
