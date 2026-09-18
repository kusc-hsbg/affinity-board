import os
import re
import urllib.request
from pathlib import Path

SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

def get_all_links():
    links = set()
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        
        # 1. Find original imweb links
        imweb_pattern = r'(?:https?://|//|/vendor/)[^\s"\'>]*imweb\.me/[^\s"\'>]+'
        matches = re.findall(imweb_pattern, content)
        for match in matches:
            cleaned = re.split(r'[)\s"\'>;]', match)[0]
            if cleaned.startswith('http'):
                url = cleaned
            elif cleaned.startswith('//'):
                url = 'https:' + cleaned
            elif cleaned.startswith('/vendor/'):
                url = 'https://' + cleaned[8:]
            else:
                url = 'https://' + cleaned
            links.add(url)
            
        # 2. Find /cdn-proxy/ links and convert them back to original URLs
        proxy_pattern = r'/cdn-proxy/[^\s"\'>]+'
        matches = re.findall(proxy_pattern, content)
        for match in matches:
            cleaned = re.split(r'[)\s"\'>;]', match)[0]
            path = cleaned[11:] # remove /cdn-proxy/
            if 'thumbnail' in path or 'upload' in path:
                url = f"https://vendor-cdn.imweb.me/{path}"
            else:
                url = f"https://static.imweb.me/{path}"
            links.add(url)
            
    return links

def download_assets(links):
    os.makedirs(ASSETS_DIR, exist_ok=True)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://affinityuniverse.com/',
    }
    
    success = 0
    fail = 0
    for url in links:
        try:
            if 'vendor-cdn.imweb.me' in url:
                path = url.split('vendor-cdn.imweb.me/')[-1]
            elif 'cdn.imweb.me' in url:
                path = url.split('cdn.imweb.me/')[-1]
            elif 'static.imweb.me' in url:
                path = url.split('static.imweb.me/')[-1]
            else:
                domain = url.split('//')[-1].split('/')[0]
                path = f"{domain}/{url.split(domain + '/')[1]}" if '/' in url.split('//')[-1] else domain

            local_path = os.path.join(ASSETS_DIR, path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                with open(local_path, 'wb') as f:
                    f.write(response.read())
            success += 1
        except Exception:
            fail += 1
    print(f"Success: {success}, Fail: {fail}")

def localize_html():
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        
        # 1. Replace all imweb.me URLs
        def replace_imweb(match):
            url = match.group(0)
            url = re.split(r'[)\s"\'>;]', url)[0]
            if 'vendor-cdn.imweb.me' in url or 'cdn.imweb.me' in url:
                path = url.split('vendor-cdn.imweb.me/')[-1] if 'vendor-cdn.imweb.me' in url else url.split('cdn.imweb.me/')[-1]
                return f"/assets/{path}"
            elif 'static.imweb.me' in url:
                path = url.split('static.imweb.me/')[-1]
                return f"/assets/static.imweb.me/{path}"
            else:
                domain = url.split('//')[-1].split('/')[0]
                path = url.split(domain + '/')[-1] if '/' in url.split('//')[-1] else ""
                return f"/assets/{domain}/{path}"

        imweb_pattern = r'(?:https?://|//|/vendor/)[^\s"\'>]*imweb\.me/[^\s"\'>]+'
        content = re.sub(imweb_pattern, replace_imweb, content)
        
        # 2. Replace /cdn-proxy/ with /assets/
        content = content.replace('/cdn-proxy/', '/assets/')
        
        if content != html_file.read_text(encoding='utf-8', errors='ignore'):
            html_file.write_text(content, encoding='utf-8', errors='ignore')

if __name__ == '__main__':
    links = get_all_links()
    print(f"Found {len(links)} assets.")
    download_assets(links)
    localize_html()
