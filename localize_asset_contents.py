import os
import re
from pathlib import Path

ASSETS_DIR = 'public/assets'

def localize_asset_files():
    print("Localizing links inside asset files...")
    for asset_file in Path(ASSETS_DIR).rglob('*'):
        if asset_file.suffix in ['.css', '.js']:
            content = asset_file.read_text(encoding='utf-8', errors='ignore')
            original_content = content

            # Replace imweb.me links
            # Example: //static.imweb.me/vendor/images/... -> /assets/static.imweb.me/vendor/images/...
            # Example: https://vendor-cdn.imweb.me/... -> /assets/thumbnail/...

            # 1. absolute vendor-cdn
            content = re.sub(r'https?://vendor-cdn\.imweb\.me/([^"\'>\s]+)', r'/assets/\1', content)
            # 2. protocol-relative static.imweb.me
            content = re.sub(r'//static\.imweb\.me/([^"\'>\s]+)', r'/assets/static.imweb.me/\1', content)
            # 3. relative vendor/cdn
            content = re.sub(r'/vendor/(?:vendor-)?cdn\.imweb\.me/([^"\'>\s]+)', r'/assets/\1', content)

            if content != original_content:
                asset_file.write_text(content, encoding='utf-8', errors='ignore')
                print(f"Processed asset file: {asset_file.name}")

if __name__ == '__main__':
    localize_asset_files()
