"""Build the self-contained invite with local artwork and licensed music."""
import base64
from pathlib import Path
root = Path(__file__).resolve().parents[1]
page = (root / 'dist/index.html').read_text()
css = (root / 'dist/fonts.css').read_text() + '\n' + (root / 'dist/editorial.css').read_text()
for file in (root / 'dist/assets/fonts').glob('*.woff2'):
    data=base64.b64encode(file.read_bytes()).decode('ascii')
    css=css.replace('assets/fonts/'+file.name, 'data:font/woff2;base64,'+data)
js = (root / 'dist/app.js').read_text() + '\n' + (root / 'dist/cinema.js').read_text()
page = page.replace('<link rel="stylesheet" href="fonts.css">', '')
page = page.replace('<link rel="preload" as="image" href="assets/portrait-garden.webp">', '')
page = page.replace('<link rel="stylesheet" href="editorial.css">', '<style>\n' + css + '\n</style>')
for script in ('app.js','cinema.js'):
    page = page.replace('<script src="' + script + '" defer></script>', '')
page = page.replace('</body>', '<script>\n' + js + '\n</script>\n</body>')
for name,mime in [('portrait-garden.webp','image/webp'),('cinematic-veil-glass.webp','image/webp'),('ivory-satin-macro.webp','image/webp'),('tarantella-napoletana.mp3','audio/mpeg'),('music-license.txt','text/plain;charset=utf-8')]:
    encoded = base64.b64encode((root / 'dist/assets' / name).read_bytes()).decode('ascii')
    page = page.replace('assets/' + name, 'data:' + mime + ';base64,' + encoded)
(root / 'apps-script/Index.html').write_text(page)
(root.parent / 'Nikita_Kseniya_Invite.html').write_text(page)
