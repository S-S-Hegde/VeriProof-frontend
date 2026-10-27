import urllib.request
import os

fonts_dir = r"d:\fullstack workshop\main project\frontend\public\fonts"
os.makedirs(fonts_dir, exist_ok=True)

urls = [
    ("MazzardH-Regular.ttf", "https://cdn.prod.website-files.com/6720dd1ab6df0da205830ab1/674f20208bbdbd30b4635789_MazzardH-Regular.ttf"),
    ("MazzardH-Medium.ttf", "https://cdn.prod.website-files.com/6720dd1ab6df0da205830ab1/674f20202ca6f40e81582668_MazzardH-Medium.ttf"),
    ("MazzardH-Light.ttf", "https://cdn.prod.website-files.com/6720dd1ab6df0da205830ab1/67a0b0fb1a3835b7c79f7313_MazzardH-Light.ttf")
]

for name, url in urls:
    path = os.path.join(fonts_dir, name)
    print(f"Downloading {name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    data = urllib.request.urlopen(req).read()
    with open(path, "wb") as f:
        f.write(data)
    print(f"Saved {name}, size: {len(data)} bytes")
