import re

with open(r"d:\fullstack workshop\main project\frontend\src\pages\About\scratch_eterna.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find background styles on body or page wrapper
bg_matches = re.findall(r'background(?:-color)?:\s*#[0-9a-fA-F]{3,8}', html)
print("HTML inline background colors:", set(bg_matches))

# Look for classes on <body> and first children
body_match = re.search(r'<body[^>]*>', html)
print("BODY TAG:", body_match.group(0) if body_match else "None")

# Find main section classes
div_classes = set(re.findall(r'class=[\"\']([^\"\']*(?:hero|section|page|main|about)[^\"\']*)[\"\']', html, re.I))
print("SECTION CLASSES:", list(div_classes)[:10])
