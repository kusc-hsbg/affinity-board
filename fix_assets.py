import os
import requests
from pathlib import Path
import re

# Configuration
SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

def fix_broken_assets():
    print("Scanning for broken assets...")
    broken_count = 0
    downloaded_count = 0

    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        # Find all /assets/... links
        links = re.findall(r'/assets/([^"\'>\s]+)', content)

        for link in links:
            local_path = os.path.join('public', 'assets', link)
            if not os.path.exists(local_path):
                broken_count += 1
                # Convert back to proxy URL
                # /assets/thumbnail/20230511/ecde84ca9b797.png -> https://affinityuniverse.com/vendor/cdn.imweb.me/thumbnail/20230511/ecde84ca9b797.png
                proxy_url = f"https://affinityuniverse.com/vendor/cdn.imweb.me/{link}"

                try:
                    os.makedirs(os.path.dirname(local_path), exist_ok=True)
                    response = requests.get(
                        proxy_url,
                        timeout=10,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://affinityuniverse.com/'
                        }
                    )
                    if response.status_code == 200:
                        with open(local_path, 'wb') as f:
                            f.write(response.content)
                        downloaded_count += 1
                except Exception as e:
                    print(f"Error downloading {proxy_url}: {e}")

    print(f"Found {broken_count} broken links. Successfully downloaded {downloaded_count}.")

if __name__ == '__main__':
    fix_broken_assets()
