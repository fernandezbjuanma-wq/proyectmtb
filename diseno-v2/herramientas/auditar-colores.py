#!/usr/bin/env python3
import sys, os, re, json

args = sys.argv[1:]
estricto = '--estricto' in args
as_json = '--json' in args
tokens_arg = None
if '--tokens' in args:
    idx = args.index('--tokens')
    if idx + 1 < len(args):
        tokens_arg = args[idx + 1]

skip_vals = {'--estricto', '--json', '--tokens'}
if tokens_arg:
    skip_vals.add(tokens_arg)

targets = [a for a in args if a not in skip_vals and not a.startswith('--')]
if not targets:
    print("Uso: python auditar-colores.py <archivo|carpeta>... [--estricto] [--json] [--tokens ruta.css]")
    sys.exit(2)

base_dir = os.path.dirname(os.path.abspath(__file__))
tokens_path = os.path.abspath(tokens_arg or os.path.join(base_dir, '..', 'tokens', 'tokens-verde-tactico.css'))

def hex_to_rgba(h):
    h = h[1:]
    if len(h) in (3, 4):
        h = ''.join(c + c for c in h)
    if len(h) not in (6, 8):
        return None
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    a = round(int(h[6:8], 16) / 255.0, 3) if len(h) == 8 else 1.0
    return (r, g, b, a)

def hsl_to_rgb(h, s, l):
    s /= 100.0
    l /= 100.0
    h = ((h % 360) + 360) % 360
    def k(n): return (n + h / 30.0) % 12
    a = s * min(l, 1.0 - l)
    def f(n): return l - a * max(-1.0, min(k(n) - 3.0, min(9.0 - k(n), 1.0)))
    return (round(f(0) * 255), round(f(8) * 255), round(f(4) * 255))

def parse_fn(s):
    m = re.match(r'^(rgba?|hsla?)\(\s*([^)]*)\)$', s, re.IGNORECASE)
    if not m:
        return None
    parts = re.split(r'[\s,]+', m.group(2).replace('/', ' ').strip())
    parts = [p for p in parts if p]
    if any('var(' in p or 'calc(' in p for p in parts):
        return None
    try:
        a = float(parts[3][:-1])/100.0 if parts[3].endswith('%') else float(parts[3]) if len(parts) > 3 else 1.0
        if m.group(1).lower().startswith('rgb'):
            c = [round(float(p[:-1]) * 2.55) if p.endswith('%') else round(float(p)) for p in parts[:3]]
            return (c[0], c[1], c[2], a)
        h, s2, l = float(parts[0]), float(parts[1]), float(parts[2])
        rgb = hsl_to_rgb(h, s2, l)
        return (rgb[0], rgb[1], rgb[2], a)
    except Exception:
        return None

COLOR_RE = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b|\b(?:rgba?|hsla?)\([^)]*\)')
def key(c): return f"{c[0]},{c[1]},{c[2]}"
def hex2(c): return '#' + ''.join(f"{v:02X}" for v in c[:3])

if not os.path.exists(tokens_path):
    print('No encuentro el archivo de tokens: ' + tokens_path)
    sys.exit(2)

with open(tokens_path, 'r', encoding='utf8') as f:
    token_src = f.read()

token_css = re.sub(r'/\*[\s\S]*?\*/', '', token_src)
aprobados = {}
token_names = []

for m in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+);', token_css):
    var_name, val = m.group(1), m.group(2)
    for cm in COLOR_RE.finditer(val):
        cstr = cm.group(0)
        c = hex_to_rgba(cstr) if cstr.startswith('#') else parse_fn(cstr)
        if not c:
            continue
        k = key(c)
        if k not in aprobados:
            aprobados[k] = var_name

root_m = re.search(r':root\s*\{([\s\S]*?)\n\}', token_css)
root_block = root_m.group(1) if root_m else ''
for m in re.finditer(r'(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;', root_block):
    var_name, val = m.group(1), m.group(2)
    c = hex_to_rgba(val)
    if c and c[3] >= 0.99 and not var_name.endswith('-ink') and var_name != '--strava':
        token_names.append({'n': var_name, 'c': c})

for m in re.finditer(r'\bcolor\s*:\s*(#[0-9a-fA-F]{3,8})\b', token_css):
    c = hex_to_rgba(m.group(1))
    if c and key(c) not in aprobados:
        aprobados[key(c)] = '(.zt-*)'

aprobados['0,0,0'] = 'negro'
aprobados['255,255,255'] = 'blanco'

def cercano(c):
    best = None
    bd = 1e9
    for t in token_names:
        d = (t['c'][0] - c[0])**2 + (t['c'][1] - c[1])**2 + (t['c'][2] - c[2])**2
        if d < bd:
            bd = d
            best = t['n']
    return best

FONT_OK = re.compile(r'^(var\(|inherit|initial|unset|system-ui|-apple-system|sans-serif|monospace|ui-monospace|arial narrow|barlow|barlow condensed|segoe ui|arial)', re.IGNORECASE)
FONT_MAL = re.compile(r'(inter|roboto|archivo|b612|big shoulders|public sans|poppins|montserrat|open sans|lato|helvetica|times|georgia|courier|sf pro|oswald|bebas|rajdhani|orbitron|space grotesk|ibm plex|jetbrains|fira)', re.IGNORECASE)

EXT = {'.css', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.svg', '.scss'}
SKIP_DIR = {'node_modules', '.git', 'dist', 'build', 'referencia', 'prototipo', 'fuente-prototipo', 'fuentes', '.next', 'coverage'}

files = []
def walk(p):
    if os.path.isdir(p):
        bname = os.path.basename(p)
        if bname in SKIP_DIR and os.path.abspath(p) not in [os.path.abspath(t) for t in targets]:
            return
        for f in os.listdir(p):
            walk(os.path.join(p, f))
    elif os.path.splitext(p)[1].lower() in EXT and os.path.abspath(p) != tokens_path:
        files.append(p)

for t in targets:
    if not os.path.exists(t):
        print('No existe: ' + t)
        sys.exit(2)
    walk(t)

bad = {}
font_bad = []
pal_bad = []
total_colores = 0
total_ok = 0
usos_var = 0

for fpath in files:
    with open(fpath, 'r', encoding='utf8', errors='ignore') as f:
        lines = f.read().split('\n')
    en_comentario = False
    for i, line in enumerate(lines):
        if len(line) > 4000 and 'base64,' in line:
            continue
        if 'audit:ok' in line:
            continue
        L = line
        if en_comentario:
            e = L.find('*/')
            if e < 0:
                continue
            L = L[e+2:]
            en_comentario = False
        while True:
            ini = L.find('/*')
            if ini < 0:
                break
            e = L.find('*/', ini + 2)
            if e < 0:
                L = L[:ini]
                en_comentario = True
                break
            L = L[:ini] + ' ' + L[e+2:]
        L = re.sub(r'(^|\s)//.*$', r'\1', L)
        usos_var += len(re.findall(r'var\(--', L))
        for m in COLOR_RE.finditer(L):
            cstr = m.group(0)
            c = hex_to_rgba(cstr) if cstr.startswith('#') else parse_fn(cstr)
            if not c:
                continue
            total_colores += 1
            if key(c) in aprobados:
                total_ok += 1
                continue
            k = hex2(c)
            if k not in bad:
                bad[k] = {'color': k, 'n': 0, 'cercano': cercano(c), 'sitios': []}
            b = bad[k]
            b['n'] += 1
            rel_site = f"{os.path.relpath(fpath)}:{i+1}"
            if len(b['sitios']) < 4:
                b['sitios'].append(rel_site)

        for m in re.finditer(r'font-family\s*:\s*([^;}{]+)', L, re.IGNORECASE):
            raw = m.group(1).strip()
            first = re.split(r',', raw)[0].replace("'", "").replace('"', '').strip()
            if not FONT_OK.match(first) or FONT_MAL.search(first):
                font_bad.append({'fuente': raw[:60], 'sitio': f"{os.path.relpath(fpath)}:{i+1}"})

        for m in re.finditer(r'data-pal\s*=\s*["\']?(semaforo|hud|cerro)["\']?', L, re.IGNORECASE):
            pal_bad.append({'paleta': m.group(1), 'sitio': f"{os.path.relpath(fpath)}:{i+1}"})

lista = sorted(bad.values(), key=lambda x: x['n'], reverse=True)
resultado = {
    'archivos': len(files),
    'colores_totales': total_colores,
    'colores_aprobados': total_ok,
    'colores_fuera_del_diseno': total_colores - total_ok,
    'colores_distintos_fuera': len(lista),
    'usos_de_var': usos_var,
    'fuentes_fuera': font_bad,
    'paletas_excluidas': pal_bad,
    'detalle': lista
}

if as_json:
    print(json.dumps(resultado, indent=2))
else:
    print("\nAuditoría de colores · diseño V2 «Verde táctico»")
    print(f"Archivos revisados: {len(files)} · colores encontrados: {total_colores} · aprobados: {total_ok} · FUERA del diseño: {total_colores - total_ok} ({len(lista)} distintos) · usos de var(--…): {usos_var}\n")
    if lista:
        print('COLORES FUERA DEL DISEÑO (reemplazar por el token más parecido, o pedir aprobación):')
        for b in lista[:60]:
            print(f"  {b['color']}  ×{str(b['n']).ljust(4)} token más cercano: var({b['cercano']})   {'  '.join(b['sitios'])}")
        if len(lista) > 60:
            print(f"  … y {len(lista) - 60} colores más (usá --json para ver todos)")
    if font_bad:
        print('\nFUENTES FUERA DEL DISEÑO (solo Barlow y Barlow Condensed):')
        for f in font_bad[:30]:
            print(f"  {f['fuente']}   {f['sitio']}")
    if pal_bad:
        print('\nPALETAS EXCLUIDAS (semáforo / hud / cerro no están aprobadas):')
        for p in pal_bad[:20]:
            print(f"  {p['paleta']}   {p['sitio']}")
    falla = bool(lista or font_bad or pal_bad)
    print('\nRESULTADO: ✖ hay diferencias con el diseño aprobado.' if falla else '\nRESULTADO: ✔ todos los colores y fuentes pertenecen al diseño aprobado.')

if estricto and (lista or font_bad or pal_bad):
    sys.exit(1)
