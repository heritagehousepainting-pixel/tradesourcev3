with open('/Users/jack/pi-workspaces/tradesource-dev/app/jobs/page.tsx') as f:
    content = f.read()
original = content

# Find the actual scope badge line
import re
# Find the span containing job.scope
matches = list(re.finditer(r"<span[^>]*backgroundColor[^>]*>\{job\.scope\}", content))
for m in matches:
    print(f"Found at pos {m.start()}: {repr(content[m.start():m.start()+150])}")

# Also look for the green-soft badge context
matches2 = list(re.finditer(r"Open.*?</span>", content))
for m in matches2:
    print(f"Open badge: {repr(content[m.start()-200:m.start()+50])}")
