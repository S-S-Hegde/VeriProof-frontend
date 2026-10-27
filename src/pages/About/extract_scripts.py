import re

with open(r"d:\fullstack workshop\main project\frontend\src\pages\About\scratch_eterna.html", "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', html, flags=re.DOTALL)
with open(r"d:\fullstack workshop\main project\frontend\src\pages\About\eterna_scripts.txt", "w", encoding="utf-8") as out:
    for i, s in enumerate(scripts):
        out.write(f"\n{'='*40}\n=== INLINE SCRIPT {i+1} ===\n{'='*40}\n")
        out.write(s + "\n")

print(f"Wrote {len(scripts)} inline scripts to eterna_scripts.txt")
