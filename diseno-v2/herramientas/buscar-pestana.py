with open(r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html', encoding='utf8') as f:
    for i, line in enumerate(f, 1):
        if 'function cambiarPestanaApp' in line:
            print(f"{i}: {line.strip()[:100]}")
