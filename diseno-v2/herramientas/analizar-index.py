with open(r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html', encoding='utf8') as f:
    for i, line in enumerate(f, 1):
        if any(k in line for k in ['id="tab-', 'class="bottom-nav"', 'data-view=', 'data-tab=', 'id="seccion-', 'class="tab-']):
            print(f"{i}: {line.strip()[:100]}")
