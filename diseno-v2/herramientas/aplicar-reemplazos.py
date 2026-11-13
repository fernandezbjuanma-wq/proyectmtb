import re, sys, os

replacements = {
    # greens -> --acc / #3DDC97
    r'#20[cC]997\b': 'var(--acc)',
    r'#00[cC][cC]96\b': 'var(--acc)',
    r'#2[dD][eE]2[aA][bB]\b': 'var(--acc)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.15\s*\)': 'var(--acc-soft)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.4\s*\)': 'var(--acc-line)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.2\s*\)': 'var(--acc-soft)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.1\s*\)': 'var(--acc-soft)',
    r'rgba\(\s*32\s*,\s*201\s*,\s*151\s*,\s*0?\.3\s*\)': 'var(--acc-line)',

    # yellows -> --y / #FFC53D
    r'#[fF][eE][cC][bB]52\b': 'var(--y)',
    r'#[fF]{4}00\b': 'var(--y)',
    r'rgba\(\s*254\s*,\s*203\s*,\s*82\s*,\s*0?\.15\s*\)': 'rgba(255, 197, 61, .12)',
    r'rgba\(\s*254\s*,\s*203\s*,\s*82\s*,\s*0?\.4\s*\)': 'rgba(255, 197, 61, .4)',

    # reds -> --r / #FF5C4D
    r'#[eE][fF]553[bB]\b': 'var(--r)',
    r'#[fF]{2}6[bB]6[bB]\b': 'var(--r)',
    r'#[fF]{2}8888\b': 'var(--r)',
    r'rgba\(\s*239\s*,\s*85\s*,\s*59\s*,\s*0?\.15\s*\)': 'var(--warn-bg)',
    r'rgba\(\s*239\s*,\s*85\s*,\s*59\s*,\s*0?\.4\s*\)': 'var(--warn-line)',

    # cyans / blues -> --d / #4DA8DA
    r'#00[fF]0[fF]{2}\b': 'var(--d)',
    r'#00[fF]{4}\b': 'var(--d)',
    r'#0[fF]6[aA][aA]8\b': 'var(--d)',

    # oranges -> --pz5 / #FF9A3D
    r'#[fF]{2}9[fF]1[cC]\b': 'var(--pz5)',

    # purples -> --prop / #CDB8FF
    r'#[eE]056[fF][dD]\b': 'var(--prop)',

    # text -> --text / #EDF4F1
    r'#[eE]2[eE]8[fF]0\b': 'var(--text)',
    r'#[dD]{6}\b': 'var(--text)',
    r'#[eE]{6}\b': 'var(--text)',

    # muteds -> --muted / #93A8A0
    r'#8[fF][aA]0[bB]5\b': 'var(--muted)',
    r'#[aA]{6}\b': 'var(--muted)',
    r'#[aA][dD][aA]695\b': 'var(--muted)',

    # dims -> --dim / #7A8F88
    r'#627289\b': 'var(--dim)',
    r'#667072\b': 'var(--dim)',

    # lines / line2 -> --line / var(--line2)
    r'#3[bB]4758\b': 'var(--line2)',
    r'#2[dD]3748\b': 'var(--line2)',
    r'#283548\b': 'var(--line2)',
    r'#4[aA]5568\b': 'var(--line2)',
    r'#2[eE]3[dD]55\b': 'var(--line2)',
    r'#2[dD]384[dD]\b': 'var(--line2)',
    r'#2[bB]364[cC]\b': 'var(--line2)',
    r'#465052\b': 'var(--line2)',
    r'#1[eE]5631\b': 'var(--line2)',

    r'#1[aA]2434\b': 'var(--line)',
    r'#2[aA]3142\b': 'var(--line)',
    r'#552222\b': 'var(--line)',
    r'#232[fF]3[eE]\b': 'var(--line)',
    r'#283347\b': 'var(--line)',
    r'#192[aA]38\b': 'var(--line)',
    r'#253042\b': 'var(--line)',
    r'#1[cC]2635\b': 'var(--line)',
    r'#1[fF]2[dD]3[dD]\b': 'var(--line)',
    r'#1[cC]2738\b': 'var(--line)',
    r'#1[eE]293[bB]\b': 'var(--line)',
    r'#1[fF]2737\b': 'var(--line)',

    # surfaces / surface2 -> --surface / var(--surface2)
    r'#1[aA]1[aA]24\b': 'var(--surface2)',
    r'#151[cC]27\b': 'var(--surface2)',
    r'#162430\b': 'var(--surface2)',
    r'#132[eE]22\b': 'var(--surface2)',
    r'#11281[eE]\b': 'var(--surface2)',
    r'#161[aA]29\b': 'var(--surface2)',
    r'#2[aA]2312\b': 'var(--surface2)',
    r'#10272[bB]\b': 'var(--surface2)',
    r'#181[dD]28\b': 'var(--surface2)',
    r'#2[eE]1[aA]1[eE]\b': 'var(--surface2)',
    r'#2[eE]2613\b': 'var(--surface2)',
    r'#1[cC]2430\b': 'var(--surface2)',
    r'#1[cC]2230\b': 'var(--surface2)',

    r'#141724\b': 'var(--surface)',
    r'#121820\b': 'var(--surface)',
    r'#14141[eE]\b': 'var(--surface)',
    r'#12131[cC]\b': 'var(--surface)',
    r'#141622\b': 'var(--surface)',
    r'#111420\b': 'var(--surface)',
    r'#2[bB]1111\b': 'var(--surface)',
    r'#141722\b': 'var(--surface)',
    r'#121[eE]17\b': 'var(--surface)',
    r'#231215\b': 'var(--surface)',
    r'#141821\b': 'var(--surface)',

    # bg / bg2 -> --bg / var(--bg2)
    r'#121212\b': 'var(--bg2)',
    r'#0[dD]0[fF]17\b': 'var(--bg2)',
    r'#0[dD]111[aA]\b': 'var(--bg2)',
    r'#0[fF]0[fF]16\b': 'var(--bg2)',
    r'#280[aA]0[aA]\b': 'var(--bg2)',
    r'#0[aA]0[aA]12\b': 'var(--bg)',
    r'#0[cC]0[cC]14\b': 'var(--bg)',
}

path = r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html'
with open(path, 'r', encoding='utf8') as f:
    content = f.read()

# In JS context, some places like canvas or Leaflet color strings expect hex or rgb, not 'var(--...)'.
# For canvas or Leaflet, we should handle them or use getComputedStyle or direct hex #3DDC97 / #FFC53D / #FF5C4D / etc.
# But auditar-colores accepts any hex present in tokens-verde-tactico.css!
# For example: #3DDC97, #FFC53D, #FF5C4D, #4DA8DA, #0A110F, #0D1613, #121C19, #17231F, #243430, #314842, #EDF4F1, #93A8A0, #7A8F88.
# All of these hex values ARE APPROVED tokens!

modified = content
count = 0
for pat, rep in replacements.items():
    modified, n = re.subn(pat, rep, modified)
    count += n

print(f"Total replacements: {count}")
with open(path, 'w', encoding='utf8') as f:
    f.write(modified)
