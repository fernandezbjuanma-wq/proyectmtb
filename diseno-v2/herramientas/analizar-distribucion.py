import re

with open(r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html', encoding='utf8') as f:
    lines = f.readlines()

in_style = 0
in_html = 0
in_script = 0

for i, line in enumerate(lines, 1):
    # check if line has old colors like #20c997
    if re.search(r'#(?:20C997|8FA0B5|3B4758|2D3748|FECB52|1A1A24|EF553B|121212|151C27|283548|E056FD|4A5568|E2E8F0|FF9F1C|141724|00F0FF|AAAAAA)\b', line, re.I):
        if i < 1792:
            in_style += 1
        elif i < 3152:
            in_html += 1
        else:
            in_script += 1

print(f"Bad color lines in <style>: {in_style}")
print(f"Bad color lines in HTML markup: {in_html}")
print(f"Bad color lines in <script>: {in_script}")
