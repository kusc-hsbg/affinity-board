import os
import re
from pathlib import Path

SITE_DIR = 'public/site'

def replace_links(content):
    # 1. Replace /assets/thumbnail/ and /assets/upload/ with absolute vendor-cdn URLs
    content = content.replace('/assets/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/assets/upload/', 'https://vendor-cdn.imweb.me/upload/')
    
    # 2. Replace other /assets/ paths with absolute static.imweb.me URLs
    # This is a bit dangerous because some assets might actually be local.
    # But to be "pixel-perfect", we should trust the original CDN.
    # We will use a regex to find /assets/ paths that aren't thumbnails or uploads.
    def replace_static(match):
        path = match.group(1)
        if 'thumbnail' in path or 'upload' in path:
            return match.group(0) # Leave it for the first two replaces
        return f"https://static.imweb.me/{path}"

    content = re.sub(r'/assets/([^\s"\'>]+)', replace_static, content)
    
    # 3. Ensure /cdn-proxy/ is also absolute
    content = content.replace('/cdn-proxy/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/cdn-proxy/upload/', 'https://vendor-cdn.imweb.me/upload/')
    content = content.replace('/cdn-proxy/', 'https://static.imweb.me/')
    
    return content

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        new_content = replace_links(content)
        if new_content != content:
            html_file.write_text(new_content, encoding='utf-8', errors='ignore')
            print(f"Fixed {html_file.name}")
