#!/usr/bin/env python3
"""Build standalone.html: index.html with CSS, JS and the background photo inlined.

Open standalone.html directly from a phone's Files app (file:// or content://)
and everything still loads. Run after editing index.html, css/ or js/:

    python3 tools/build_standalone.py
"""
import base64
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO = 'assets/photos/draped-candlelight-bg.jpg'

html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'css/styles.css').read_text(encoding='utf-8')
js = (ROOT / 'js/app.js').read_text(encoding='utf-8')
photo_uri = 'data:image/jpeg;base64,' + base64.b64encode((ROOT / PHOTO).read_bytes()).decode('ascii')

css = css.replace("url('../" + PHOTO + "')", "url('" + photo_uri + "')")

link = '<link rel="stylesheet" href="css/styles.css" />'
script = '<script src="js/app.js"></script>'
assert link in html and script in html, 'index.html no longer references css/js as expected'

html = html.replace(link, '<style>\n' + css + '\n</style>')
html = html.replace(script, '<script>\n' + js.replace('</script', '<\\/script') + '\n</script>')

def data_uri(rel):
    mime = mimetypes.guess_type(rel)[0] or 'application/octet-stream'
    return 'data:%s;base64,%s' % (mime, base64.b64encode((ROOT / rel).read_bytes()).decode('ascii'))


# Images referenced by src="assets/..." or icon href="assets/..." (og:image stays a path)
html = re.sub(r'(src|href)="(assets/[^"]+)"', lambda m: '%s="%s"' % (m.group(1), data_uri(m.group(2))), html)

(ROOT / 'standalone.html').write_text(html, encoding='utf-8')
print('Wrote standalone.html (%d KB)' % (len(html.encode('utf-8')) // 1024))
