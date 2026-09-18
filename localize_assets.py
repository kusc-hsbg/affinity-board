import os
import re
import requests
from pathlib import Path

# Configuration
SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

def get_all_imweb_links():
    links = set()
    # Match absolute: https://...imweb.me/...
    # Match protocol-relative: //...imweb.me/...
    # Match relative: /vendor/...imweb.me/...
    pattern = r'(?:https?://|//|/vendor/)[^\s"\'>]*imweb\.me/[^\s"\'>]+'

    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        matches = re.findall(pattern, content)
        for match in matches:
            # Clean trailing characters
            cleaned_match = re.split(r'[)\s"\'>;]', match)[0]
            # Normalize to absolute URL for downloading
            if cleaned_match.startswith('http'):
                url = cleaned_match
            elif cleaned_match.startswith('//'):
                url = 'https:' + cleaned_match
            elif cleaned_match.startswith('/vendor/'):
                # Convert /vendor/static.imweb.me/... to https://static.imweb.me/...
                domain_and_path = cleaned_match[8:]
                url = 'https://' + domain_and_path
            else:
                url = 'https://' + cleaned_match
            links.add(url)
    return links

def download_assets(links):
    print(f"Found {len(links)} unique assets to download.")
    for url in links:
        try:
            # Determine a local path based on the domain and path
            if 'vendor-cdn.imweb.me' in url or 'cdn.imweb.me' in url:
                path_part = url.split('vendor-cdn.imweb.me/')[-1] if 'vendor-cdn.imweb.me' in url else url.split('cdn.imweb.me/')[-1]
            else:
                domain = url.split('//')[-1].split('/')[0]
                path_part = f"{domain}/{url.split(domain + '/')[1]}"

            local_path = os.path.join(ASSETS_DIR, path_part)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            if os.path.exists(local_path):
                continue

            # Use proxy if it's a vendor-cdn link
            request_url = url
            if 'vendor-cdn.imweb.me' in url or 'cdn.imweb.me' in url:
                request_url = url.replace('https://vendor-cdn.imweb.me/', 'https://affinityuniverse.com/vendor/cdn.imweb.me/')
                request_url = request_url.replace('https://cdn.imweb.me/', 'https://affinityuniverse.com/vendor/cdn.imweb.me/')
                request_url = request_url.replace('http://', 'https://')

            response = requests.get(
                request_url,
                timeout=10,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://affinityuniverse.com/'
                }
            )
            if response.status_code == 200:
                with open(local_path, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded: {path_part}")
            else:
                print(f"Failed to download {request_url} - Status: {response.status_code}")
        except Exception as e:
            print(f"Error downloading {url}: {e}")

def replace_links():
    print("Replacing links in HTML files...")
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        original_content = content

        # Replace all imweb.me URLs
        def replace_func(match):
            url = match.group(0)
            # Remove trailing punctuation
            url = re.split(r'[)\s"\'>;]', url)[0]

            # Normalize to a path
            if 'vendor-cdn.imweb.me' in url or 'cdn.imweb.me' in url:
                path = url.split('vendor-cdn.imweb.me/')[-1] if 'vendor-cdn.imweb.me' in url else url.split('cdn.imweb.me/')[-1]
                return f"/assets/{path}"
            else:
                # Handle protocol-relative or absolute
                domain_part = url
                if domain_part.startswith('http'):
                    domain_part = domain_part.split('//')[-1]
                elif domain_part.startswith('/vendor/'):
                    domain_part = domain_part[8:]
                elif domain_part.startswith('//'):
                    domain_part = domain_part[2:]

                domain = domain_part.split('/')[0]
                path = domain_part.split(domain + '/')[1] if '/' in domain_part[len(domain):] else ""
                if not path:
                    return f"/assets/{domain}"
                return f"/assets/{domain}/{path}"

        # Regex for URLs containing imweb.me
        pattern = r'(?:https?://|//|/vendor/)[^\s"\'>]*imweb\.me/[^\s"\'>]+'
        content = re.sub(pattern, replace_func, content)

        if content != original_content:
            html_file.write_text(content, encoding='utf-8')
            print(f"Processed {html_file.name}")

if __name__ == '__main__':
    os.makedirs(ASSETS_DIR, exist_ok=True)
    links = get_all_imweb_links()
    download_assets(links)
    replace_links()
    print("Finished asset localization.")
