import os
from pathlib import Path

SITE_DIR = 'public/site'

with open('menu_structure.html', 'r', encoding='utf-8') as f:
    MENU_HTML = f.read()

with open('menu_style.css', 'r', encoding='utf-8') as f:
    MENU_CSS = f.read()

def process_html(content):
    # Remove any previously injected menus
    content = content.replace('<div id="pc_slide_menu_wrap"', '<!-- menu start -->')
    # This is a bit crude, let's just replace the whole section if we can.
    # Actually, better to just remove the mock menu I added before.
    content = content.replace('<div id="slide-nav-btn"', '<!-- mock menu -->')
    
    # Re-inject the real menu
    if 'id="pc_slide_menu_wrap"' not in content:
        if '</body>' in content:
            content = content.replace('</body>', f'{MENU_CSS}{MENU_HTML}</body>')
        else:
            content = content + MENU_CSS + MENU_HTML
            
    # Fix the image paths in the injected HTML to use our proxy
    content = content.replace('https://cdn.imweb.me/', '/cdn-proxy/')
    content = content.replace('https://vendor-cdn.imweb.me/', '/cdn-proxy/')
    
    return content

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8', errors='ignore')
        new_content = process_html(content)
        if new_content != content:
            html_file.write_text(new_content, encoding='utf-8', errors='ignore')
            print(f"Injected real menu into {html_file.name}")
