import sys
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import label

SRC_DIR = Path("public/products")
OUT_SIZE = 800
MARGIN_RATIO = 0.14
DARK_THRESH = 40
WHITE_THRESH = 248
BORDER = 6


def corners_are_dark(img: np.ndarray) -> bool:
    h, w = img.shape[:2]
    pts = [img[0, 0], img[0, w - 1], img[h - 1, 0], img[h - 1, w - 1]]
    return all(int(p[0]) < DARK_THRESH and int(p[1]) < DARK_THRESH and int(p[2]) < DARK_THRESH for p in pts)


def whiten_with_grabcut(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    rect = (BORDER, BORDER, w - 2 * BORDER, h - 2 * BORDER)
    cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 14, cv2.GC_INIT_WITH_RECT)
    fg = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)
    out = img.copy()
    out[~fg] = (255, 255, 255)
    return mop_up_border_halo(out)


def mop_up_border_halo(img: np.ndarray) -> np.ndarray:
    # GrabCut sometimes leaves a faint soft-shadow fringe along the old black
    # backdrop edge. Anything still dark and reachable from the border once
    # the bulk of the background is already white is leftover halo, not item.
    dark = (img[:, :, 0] < 90) & (img[:, :, 1] < 90) & (img[:, :, 2] < 90)
    if not dark.any():
        return img
    labeled, _ = label(dark)
    border_labels = set(labeled[0, :].tolist()) | set(labeled[-1, :].tolist()) | set(labeled[:, 0].tolist()) | set(labeled[:, -1].tolist())
    border_labels.discard(0)
    if not border_labels:
        return img
    halo = np.isin(labeled, list(border_labels))
    img = img.copy()
    img[halo] = (255, 255, 255)
    return img


def bbox_of_content(img_rgb: np.ndarray):
    non_white = (img_rgb[:, :, 0] < WHITE_THRESH) | (img_rgb[:, :, 1] < WHITE_THRESH) | (img_rgb[:, :, 2] < WHITE_THRESH)
    rows = np.any(non_white, axis=1)
    cols = np.any(non_white, axis=0)
    if not rows.any():
        return None
    y0, y1 = np.where(rows)[0][[0, -1]]
    x0, x1 = np.where(cols)[0][[0, -1]]
    return (int(x0), int(y0), int(x1) + 1, int(y1) + 1)


def normalize(path: Path):
    img = cv2.imread(str(path))  # BGR
    if corners_are_dark(img):
        img = whiten_with_grabcut(img)

    box = bbox_of_content(img)
    if box:
        x0, y0, x1, y1 = box
        cropped = img[y0:y1, x0:x1]
    else:
        cropped = img

    ch, cw = cropped.shape[:2]
    canvas_dim = int(max(cw, ch) * (1 + MARGIN_RATIO))
    canvas = np.full((canvas_dim, canvas_dim, 3), 255, dtype=np.uint8)
    oy, ox = (canvas_dim - ch) // 2, (canvas_dim - cw) // 2
    canvas[oy:oy + ch, ox:ox + cw] = cropped

    final = cv2.resize(canvas, (OUT_SIZE, OUT_SIZE), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(str(path), final, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return path


def main():
    targets = sys.argv[1:]
    files = [SRC_DIR / t for t in targets] if targets else sorted(SRC_DIR.glob("*.jpg"))
    for f in files:
        normalize(f)
        print("done", f)


if __name__ == "__main__":
    main()
