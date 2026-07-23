from PIL import Image
from collections import deque
import sys

src = sys.argv[1]
dst = sys.argv[2]

img = Image.open(src).convert("RGBA")
w, h = img.size
px = img.load()

def is_bgish(p):
    r, g, b, a = p
    return r < 40 and g < 40 and b < 40

visited = [[False] * w for _ in range(h)]
q = deque()

for x in range(w):
    for y in (0, h - 1):
        if is_bgish(px[x, y]):
            q.append((x, y))
            visited[y][x] = True
for y in range(h):
    for x in (0, w - 1):
        if is_bgish(px[x, y]):
            q.append((x, y))
            visited[y][x] = True

while q:
    x, y = q.popleft()
    r, g, b, a = px[x, y]
    px[x, y] = (r, g, b, 0)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and is_bgish(px[nx, ny]):
            visited[ny][nx] = True
            q.append((nx, ny))

img.save(dst)
print("saved", dst)
