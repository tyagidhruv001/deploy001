
import os

filepath = r"c:\Users\hp\Downloads\poison\cynide\frontend\pages\dashboard\customer\customer-dashboard.js"

if not os.path.exists(filepath):
    print(f"Error: {filepath} not found.")
    exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
in_head = False
in_vengeance = False

for line in lines:
    if "<<<<<<< HEAD" in line or "/* CONFLICT START */" in line:
        skip = True
        in_head = True
        continue
    if "=======" in line and in_head:
        skip = False
        in_head = False
        in_vengeance = True
        continue
    if (">>>>>>> vengeance2.0" in line or ">>>>>>> main" in line) and in_vengeance:
        skip = False
        in_vengeance = False
        continue
    
    if not skip or in_vengeance:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Conflict resolved via Python script.")
