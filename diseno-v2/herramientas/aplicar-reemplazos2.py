import re

replacements = {
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.35\s*\)': 'var(--acc-line)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.25\s*\)': 'var(--acc-soft)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.9\s*\)': 'var(--acc-line)',
    r'#aaa\b': 'var(--muted)',
    r'rgba\(\s*239\s*,\s*85\s*,\s*59\s*,\s*0?\.35\s*\)': 'var(--warn-line)',
    r'rgba\(\s*0\s*,\s*240\s*,\s*255\s*,\s*0?\.4\s*\)': 'rgba(77, 168, 218, 0.4)',
    r'rgba\(\s*15\s*,\s*15\s*,\s*22\s*,\s*0?\.92\s*\)': 'var(--scrim)',
    r'#ddd\b': 'var(--text)',
    r'rgba\(\s*10\s*,\s*10\s*,\s*18\s*,\s*0?\.9\s*\)': 'var(--scrim)',
    r'rgba\(\s*40\s*,\s*10\s*,\s*10\s*,\s*0?\.92\s*\)': 'var(--scrim)',
    r'#eee\b': 'var(--text)',
}

path = r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html'
with open(path, 'r', encoding='utf8') as f:
    content = f.read()

modified = content
count = 0
for pat, rep in replacements.items():
    modified, n = re.subn(pat, rep, modified)
    count += n

print(f"Additional replacements: {count}")
with open(path, 'w', encoding='utf8') as f:
    f.write(modified)
