import os
import re
import urllib.request
from pathlib import Path
import csv
import sys

# Fix encoding for terminal output
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

USERS_CSV = 'users_list.csv'
SITE_DIR = 'public/site'

def localize_content(content):
    def replace_imweb(match):
        url = match.group(0)
        url = re.split(r'[)\s"\'>;]', url)[0]
        if 'vendor-cdn.imweb.me' in url or 'cdn.imweb.me' in url:
            path = url.split('vendor-cdn.imweb.me/')[-1] if 'vendor-cdn.imweb.me' in url else url.split('cdn.imweb.me/')[-1]
            return f"https://vendor-cdn.imweb.me/{path}"
        elif 'static.imweb.me' in url:
            path = url.split('static.imweb.me/')[-1]
            return f"https://static.imweb.me/{path}"
        else:
            domain = url.split('//')[-1].split('/')[0]
            path = url.split(domain + '/')[-1] if '/' in url.split('//')[-1] else ""
            return f"https://{domain}/{path}"

    imweb_pattern = r'(?:https?://|//|/vendor/)[^\s"\'>]*imweb\.me/[^\s"\'>]+'
    content = re.sub(imweb_pattern, replace_imweb, content)
    
    content = content.replace('/cdn-proxy/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/cdn-proxy/upload/', 'https://vendor-cdn.imweb.me/upload/')
    content = content.replace('/assets/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/assets/upload/', 'https://vendor-cdn.imweb.me/upload/')
    content = content.replace('/assets/static.imweb.me/', 'https://static.imweb.me/')
    
    return content

if __name__ == '__main__':
    os.makedirs(SITE_DIR, exist_ok=True)
    
    with open(USERS_CSV, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        success_count = 0
        fail_count = 0
        
        for row in reader:
            name = row['이름']
            birth = row['생년월일(YYMMDD)']
            slug = f"user_{birth}"
            url = f"https://affinityuniverse.com/{slug}"
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://affinityuniverse.com/',
                }
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    content = response.read().decode('utf-8', errors='ignore')
                    localized_content = localize_content(content)
                    
                    file_path = os.path.join(SITE_DIR, f"{slug}.html")
                    with open(file_path, 'w', encoding='utf-8') as html_file:
                        html_file.write(localized_content)
                    success_count += 1
            except Exception:
                fail_count += 1
                
    print(f"Completed. Success: {success_count}, Fail: {fail_count}")
