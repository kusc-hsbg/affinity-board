import os
from pathlib import Path

SITE_DIR = 'public/site'
ASSETS_DIR = 'public/assets'

def check_broken_links():
    broken = []
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        # Find all /assets/... links
        import re
        links = re.findall(r'/assets/([^"\'>\s]+)', content)
        for link in links:
            local_path = os.path.join('public', 'assets', link)
            if not os.path.exists(local_path):
                broken.append((html_file.name, link))

    return broken

if __name__ == '__main__':
    broken = check_broken_links()
    if not broken:
        print("No broken links found!")
    else:
        print(f"Found {len(broken)} broken links:")
        for file, link in broken:
            print(f"{file}: {link}")
