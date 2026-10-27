import urllib.request
import re

css_url = "https://cdn.prod.website-files.com/6720dd1ab6df0da205830ab1/css/eterna-stage.webflow.shared.ae1fe7835.css"
req = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})
css = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

targets = ['body_dark', 'hero_about', 'overlay_about_us', 'div-block-644', 'square-2', 'div-block-670', 'card-hover']
for t in targets:
    m = re.findall(rf'\.{t}[^{{]*\{{[^}}]+\}}', css)
    print(f"=== {t} ===")
    for rule in m[:3]:
        print(rule)
