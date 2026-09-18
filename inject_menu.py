import os
from pathlib import Path

SITE_DIR = 'public/site'

MENU_HTML = '''
<div id="slide-nav-btn" class="slide-nav-btn" style="position: fixed; top: 20px; left: 20px; z-index: 9999; cursor: pointer; width: 30px; height: 20px;">
    <div style="width: 100%; height: 3px; background: #000; margin-bottom: 5px;"></div>
    <div style="width: 100%; height: 3px; background: #000; margin-bottom: 5px;"></div>
    <div style="width: 100%; height: 3px; background: #000;"></div>
</div>
<div id="slidemenu" class="slide-menu" style="position: fixed; top: 0; right: -100%; width: 80%; height: 100%; background: #fff; z-index: 9998; transition: 0.3s; padding: 60px 20px; box-shadow: -2px 0 5px rgba(0,0,0,0.1);">
    <div class="slide-menu-inner">
        <ul style="list-style: none; padding: 0; font-size: 20px; line-height: 2;">
            <li><a href="/" style="text-decoration: none; color: #000;">Home</a></li>
            <li><a href="/ABOUT" style="text-decoration: none; color: #000;">About</a></li>
            <li><a href="/CONTACT" style="text-decoration: none; color: #000;">Contact</a></li>
        </ul>
    </div>
</div>
'''

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        if 'id="slidemenu"' in content:
            continue
        
        # Inject before </body>
        if '</body>' in content:
            new_content = content.replace('</body>', f'{MENU_HTML}</body>')
        else:
            new_content = content + MENU_HTML
            
        html_file.write_text(new_content, encoding='utf-8')
        print(f"Injected menu into {html_file.name}")
