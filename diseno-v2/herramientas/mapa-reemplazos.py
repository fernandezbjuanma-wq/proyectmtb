import sys, os, re, json

sys.path.insert(0, r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\diseno-v2\herramientas')
# Execute auditar-colores.py to get exact report
out = os.popen(r'python "C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\diseno-v2\herramientas\auditar-colores.py" "C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html" --json').read()
data = json.loads(out)
print(f"Total unapproved: {data['colores_fuera_del_diseno']}")
for item in data['detalle']:
    print(f"Color: {item['color']}, Count: {item['n']}, Suggestion: {item['cercano']}, Sample sites: {item['sitios'][:3]}")
