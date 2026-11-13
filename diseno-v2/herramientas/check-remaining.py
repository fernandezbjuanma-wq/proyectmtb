lines_to_check = [226, 713, 776, 945, 784, 786, 1804, 1821, 458, 597, 792, 845, 850, 1813, 1817]
with open(r'C:\Users\coni_\OneDrive\Desktop\juan\GitHub\proyectmtb\index.html', encoding='utf8') as f:
    lines = f.readlines()

for ln in lines_to_check:
    print(f"Line {ln}: {repr(lines[ln-1])}")
