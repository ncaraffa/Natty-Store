from PIL import Image
import sys

src = sys.argv[1]
dst = sys.argv[2]

BLACK_THRESHOLD = 60  # abaixo disso, é considerado fundo preto (inclui halo de anti-aliasing)
FEATHER = 25          # faixa de suavização acima do threshold, evita borda serrilhada

img = Image.open(src).convert("RGBA")
w, h = img.size
px = img.load()

# Remoção global por chroma-key: qualquer pixel próximo do preto vira transparente,
# esteja ele na borda da imagem ou "preso" dentro de um vão de letra (ex: dentro do "a", "o").
# Flood-fill a partir da borda deixava esses vãos internos como manchas pretas.
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        lum = max(r, g, b)
        if lum <= BLACK_THRESHOLD:
            px[x, y] = (r, g, b, 0)
        elif lum <= BLACK_THRESHOLD + FEATHER:
            factor = (lum - BLACK_THRESHOLD) / FEATHER
            px[x, y] = (r, g, b, int(a * factor))

# Recorta para a caixa delimitadora do conteúdo opaco e adiciona uma margem simétrica,
# assim a logo fica centralizada dentro do próprio arquivo (não só dentro do card no site).
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
    cw, ch = cropped.size
    side = max(cw, ch)
    margin = int(side * 0.06)
    canvas_size = side + margin * 2
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    paste_x = (canvas_size - cw) // 2
    paste_y = (canvas_size - ch) // 2
    canvas.paste(cropped, (paste_x, paste_y), cropped)
    img = canvas

img.save(dst)
print("saved", dst, img.size)
