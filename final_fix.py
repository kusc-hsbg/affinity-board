import os
import re
from pathlib import Path

SITE_DIR = 'public/site'

# REAL MENU HTML (Reconstructed from curl)
MENU_HTML = '''
<div id="pc_slide_menu_wrap" class="pc_slide_menu_container">
	<div id="pc_slide_menu" class="pc_slide_menu slide_menu _slide_menu">
		<button type="button" class="pc-navbar-toggle" onclick="PC_SLIDE_MENU.slideNavToggle();"><i class="btm bt-times"></i></button>
		<div class="tse-scrollable _tse_scrollable">
			<div class="tse-content">
				<div class="pc_slide_menu_logo">
					<a href="/" ><img alt="AFFINITY UNIVERSE 어피니티 유니버스" src="/cdn-proxy/upload/S20220201005ab0a1d8606/d36589b893a8e.png"></a>
				</div>
				<ul class="nav navbar-nav">
					<div class="viewport-nav pc _menu_wrap" style="position:relative">
						<li class="depth-01">
							<a class=" _fade_link " href="/ABOUT" data-url="ABOUT" data-has_child="Y">
								<span class="plain_name">ABOUT</span>
								<span class="_toggle_btn toggle-btn"></span>
							</a>
						</li>
					</div>
				</ul>
			</div>
		</div>
	</div>
</div>
'''

MENU_CSS = '''
<style>
	.pc_slide_menu_container {
		position: fixed; top: 0; bottom: 0; overflow-y: auto; overflow-x: hidden; width: 0; right: 0; z-index: 9999; visibility: visible; display: block;
	}
	.pc_slide_menu_container .pc-navbar-toggle {
		font-size: 16px; position: absolute; right: 0; top: 0; padding: 9px 15px; margin-top: 8px; margin-bottom: 8px; background: transparent; border: 1px solid transparent; color: #fff;
	}
	.pc_slide_menu_container .pc_slide_menu {
		min-width: 0; width: 300px; position: absolute; top: 0; bottom: 0; left: -300px; background: #4358d8; z-index: 9999; padding: 40px 0 0 0;
	}
	.pc_slide_menu_container .pc_slide_menu.animation {
		transition: transform 300ms ease 0s; transform: translate3d(0px, 0px, 0px);
	}
	.pc_slide_menu_container.slide_open .pc_slide_menu {
		transform: translate3d(300px, 0px, 0px); overflow-y: auto;
	}
	.pc_slide_menu_container .pc_slide_menu_logo {
		text-align: center; margin: 10px 0; padding: 0 24px;
	}
	.pc_slide_menu_container .pc_slide_menu_logo img {
		display: inline-block; max-width: 100%; height: 80px; margin-bottom: 6px;
	}
	.pc_slide_menu_container .nav.navbar-nav {
		float: none; text-align: center; padding: 0 24px;
	}
	.pc_slide_menu_container .viewport-nav li > a {
		font-family: Poppins, sans-serif; font-size: 20px; color: #fff; padding: 5.5px 0; display: inline-block; text-decoration: none;
	}
</style>
'''

def process_html(content):
    # 1. Remove mock menu injected previously
    content = re.sub(r'<div id="slide-nav-btn".*?</div>\s*<div id="slidemenu".*?</div>', '', content, flags=re.DOTALL)
    
    # 2. Update asset links to use proxy
    content = content.replace('/assets/thumbnail/', '/cdn-proxy/thumbnail/')
    content = content.replace('/assets/upload/', '/cdn-proxy/upload/')
    
    # 3. Inject real menu
    if 'id="pc_slide_menu_wrap"' not in content:
        if '</body>' in content:
            content = content.replace('</body>', f'{MENU_CSS}{MENU_HTML}</body>')
        else:
            content = content + MENU_CSS + MENU_HTML
            
    return content

if __name__ == '__main__':
    for html_file in Path(SITE_DIR).glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        new_content = process_html(content)
        if new_content != content:
            html_file.write_text(new_content, encoding='utf-8')
            print(f"Fixed {html_file.name}")
