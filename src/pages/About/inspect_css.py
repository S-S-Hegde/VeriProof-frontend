import urllib.request
import re

css_url = "https://cdn.prod.website-files.com/6720dd1ab6df0da205830ab1/css/eterna-stage.webflow.shared.ae1fe7835.css"
req = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})
css = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Find @font-face
font_faces = re.findall(r'@font-face\s*\{[^}]+\}', css)
print("FONT FACES:", len(font_faces))
for f in font_faces:
    print(f)

# Find font-family occurrences
families = set(re.findall(r'font-family:\s*([^;]+);', css))
print("FONT FAMILIES:", families)

# Find body styles
body_m = re.search(r'body\s*\{[^}]+\}', css)
if body_m:
    print("BODY CSS:", body_m.group(0))

# Find h1, h2, h3
h_m = re.findall(r'h[1-6]\s*\{[^}]+\}', css)
print("HEADING CSS:", h_m[:5])
