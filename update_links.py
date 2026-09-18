import os
import re
from pathlib import Path

SITE_DIR = 'public/site'

def replace_links(content):
    # Replace vendor-cdn.imweb.me or cdn.imweb.me links with /assets-proxy/
    # Example: /assets/thumbnail/20240205/677d42183314d.png -> /assets/thumbnail/20240205/677d42183314d.png (This is already correct for the proxy)
    # Wait, my proxy is at /assets/[...path]/route.ts. 
    # So /assets/thumbnail/... will hit the proxy if it's not in public/assets.
    # I don't need to change the links if I keep them as /assets/...
    return content

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        new_content = replace_links(content)
        if new_content != content:
            html_file.write_text(new_content, encoding='utf-8')
