import os
import re
from pathlib import Path

SITE_DIR = 'public/site'

def replace_links(content):
    # 1. Replace /cdn-proxy/ with absolute vendor-cdn URL
    content = content.replace('/cdn-proxy/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/cdn-proxy/upload/', 'https://vendor-cdn.imweb.me/upload/')
    
    # 2. Replace /assets/thumbnail/ with absolute vendor-cdn URL
    content = content.replace('/assets/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/assets/upload/', 'https://vendor-cdn.imweb.me/upload/')
    
    # 3. Replace /assets/static.imweb.me/ with absolute static URL
    content = content.replace('/assets/static.imweb.me/', 'https://static.imweb.me/')
    
    # 4. Replace /assets/css/ with absolute static URL if it's an imweb asset
    # This is trickier. Let's just handle the most common ones.
    # We know /assets/css/site/... is local, but others might be remote.
    # For now, let's focus on images and the main CSS.
    
    return content

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        new_content = replace_links(content)
        if new_content != content:
            html_file.write_text(new_content, encoding='utf-8', errors='ignore')
            print(f"Updated {html_file.name}")
