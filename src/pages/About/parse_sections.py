import re

with open(r"d:\fullstack workshop\main project\frontend\src\pages\About\scratch_eterna.html", "r", encoding="utf-8") as f:
    html = f.read()

headings = re.findall(r'<(h[1-6])[^>]*>(.*?)</\1>', html, re.DOTALL)
with open(r"d:\fullstack workshop\main project\frontend\src\pages\About\eterna_headings.txt", "w", encoding="utf-8") as out:
    for tag, content in headings:
        clean = re.sub(r'<[^>]+>', ' ', content).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if clean:
            out.write(f"[{tag.upper()}]: {clean}\n")

print("Wrote headings to eterna_headings.txt")
