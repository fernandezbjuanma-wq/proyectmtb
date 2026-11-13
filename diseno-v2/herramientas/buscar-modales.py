with open(r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html', encoding='utf8') as f:
    for i, line in enumerate(f, 1):
        if any(k in line for k in ['BikeFit', 'modal-bikefit', 'abrirModal', 'Planificador', 'Segmentos']):
            if 'function ' in line or 'id="modal' in line:
                print(f"{i}: {line.strip()[:100]}")
