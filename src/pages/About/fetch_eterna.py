import urllib.request
import re

url = 'https://www.eternacloud.com/about-us'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

css_links = re.findall(r'<link[^>]+href=[\"\']([^\"\']+\.css[^\"\']*)[\"\']', html)
print('CSS LINKS:', len(css_links), css_links[:5])

js_links = re.findall(r'<script[^>]+src=[\"\']([^\"\']+)[\"\']', html)
print('JS LINKS:', len(js_links), js_links)

# Extract fonts from <link>
font_links = [l for l in css_links if 'font' in l or 'google' in l or 'typekit' in l]
print('FONT LINKS:', font_links)

with open(r'd:\fullstack workshop\main project\frontend\src\pages\About\scratch_eterna.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Successfully saved scratch_eterna.html')
