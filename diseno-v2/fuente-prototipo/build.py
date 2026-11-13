#!/usr/bin/env python3
"""Compila el prototipo en un único HTML sin dependencias externas (CSS, JS y fuentes embebidas)."""
import base64, glob, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
FAMILY = {
    'archivo': 'Archivo', 'b612': 'B612', 'b612-mono': 'B612 Mono', 'barlow-condensed': 'Barlow Condensed',
    'barlow': 'Barlow', 'big-shoulders-display': 'Big Shoulders Display', 'public-sans': 'Public Sans',
}

def fonts_css():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'assets', 'fonts', '*.woff2'))):
        m = re.match(r'(.+)-latin-(\d+)-normal\.woff2$', os.path.basename(f))
        if not m or m.group(1) not in FAMILY:
            continue
        b64 = base64.b64encode(open(f, 'rb').read()).decode()
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (FAMILY[m.group(1)], m.group(2), b64))
    return '\n'.join(out)

def cat(pattern):
    return '\n'.join(open(p, encoding='utf8').read() for p in sorted(glob.glob(os.path.join(SRC, pattern))))

css = fonts_css() + '\n' + cat('css/*.css')
js = cat('js/*.js')
# comprobación de sintaxis antes de empaquetar
tmp = os.path.join(ROOT, 'dist', '_bundle.js')
os.makedirs(os.path.dirname(tmp), exist_ok=True)
open(tmp, 'w', encoding='utf8').write(js)
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
if r.returncode:
    print(r.stderr)
    sys.exit(1)
os.remove(tmp)

html = open(os.path.join(SRC, 'index.html'), encoding='utf8').read()
html = html.replace('/*@@CSS@@*/', css).replace('/*@@JS@@*/', js.replace('</script', '<\\/script'))
out = os.path.join(ROOT, 'dist', 'radar-tactico-v2-prototipo.html')
open(out, 'w', encoding='utf8').write(html)
print('OK', out, round(len(html) / 1024), 'KB')
