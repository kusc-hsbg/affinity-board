import os
import re
from pathlib import Path

SITE_DIR = 'public/site'

def replace_links(content):
    # 1. Absolute CDN for known Imweb paths
    content = content.replace('/assets/thumbnail/', 'https://vendor-cdn.imweb.me/thumbnail/')
    content = content.replace('/assets/upload/', 'https://vendor-cdn.imweb.me/upload/')
    
    # 2. Handle /assets/static.imweb.me/ or just /assets/ that should be on static.imweb.me
    # We want to target anything that isn't a local-only asset (like site.css)
    # Actually, let's just use a regex to find any path starting with /assets/ that isn't a thumbnail/upload
    # and point it to static.imweb.me.
    def replace_static(match):
        path = match.group(1)
        if 'thumbnail' in path or 'upload' in path:
            return match.group(0)
        return f"https://static.imweb.me/{path}"

    content = re.sub(r'/assets/([^\s"\'>]+)', replace_static, content)
    
    # 3. Fix other Imweb-specific remote paths
    content = content.replace('/_/oms-customer-front-office/style.css', 'https://static.imweb.me/_/oms-customer-front-office/style.css')
    content = content.replace('/css/custom.cm', 'https://static.imweb.me/css/custom.cm')
    
    # 4. Replace any remaining /cdn-proxy/
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
