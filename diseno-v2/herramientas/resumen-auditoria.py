import json, subprocess

out = subprocess.check_output(['python', 'auditar-colores.py', '../../index.html', '--json'], cwd=r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\diseno-v2\herramientas')
res = json.loads(out)
print(f"Archivos: {res['archivos']}")
print(f"Colores fuera: {res['colores_fuera_del_diseno']} ({res['colores_distintos_fuera']} distintos)")
print(f"Fuentes fuera: {len(res['fuentes_fuera'])}")
print(f"Paletas fuera: {len(res['paletas_excluidas'])}")
print("\n--- TOP 30 COLORES FUERA ---")
for d in res['detalle'][:30]:
    sitios_str = " | ".join(d['sitios'][:3])
    print(f"{d['color']:<9} x{d['n']:<4} -> var({d['cercano']:<11}) en {sitios_str}")

if res['fuentes_fuera']:
    print("\n--- FUENTES FUERA ---")
    for f in res['fuentes_fuera'][:10]:
        print(f"{f['fuente']} en {f['sitio']}")
