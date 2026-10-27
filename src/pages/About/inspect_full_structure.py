import re

with open(r"C:\Users\shrid\.gemini\antigravity-ide\brain\af447e51-a247-45c3-b21a-cd5822b709de\.system_generated\steps\4667\content.md", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Let's extract the main DOM hierarchy
# Find elements that contain the main texts
sections = [
    ("Hero Section", "Our Business is Clarity, Consistency"),
    ("One Adaptive Service", "One Adaptive Service"),
    ("Our Story Quote", "We set out to create the ideal business scenario"),
    ("One Vision", "One Vision"),
    ("Meet the Founders", "Meet the founders"),
    ("Core Values", "We are all One"),
    ("Our people are world-class", "Our people are world-class"),
    ("Experience work in a new way", "Experience work"),
    ("Nothing is impossible", "Nothing is impossible")
]

with open(r"C:\Users\shrid\.gemini\antigravity-ide\brain\af447e51-a247-45c3-b21a-cd5822b709de\scratch\eterna_breakdown.txt", "w", encoding="utf-8") as out:
    for name, query in sections:
        idx = text.find(query)
        out.write(f"\n{'='*30}\n=== {name} (query: {query}) ===\n{'='*30}\n")
        if idx != -1:
            snippet = text[max(0, idx - 400): idx + 1200]
            # Strip svg path noise
            clean = re.sub(r'<path[^>]*>', '', snippet)
            clean = re.sub(r'<svg[^>]*>.*?</svg>', '[SVG_ICON]', clean, flags=re.DOTALL)
            out.write(clean + "\n")
        else:
            out.write("NOT FOUND\n")

print("Wrote breakdown successfully!")
