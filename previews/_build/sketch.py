"""Makes a pencil line-drawing version of a photo (used for the "drawing to finished room" effects).
Usage: python3 sketch.py name [name ...]   (names of .webp files in previews/assets/img, without .webp)
Writes <name>-sketch.webp next to the photo."""
import os, sys
import cv2, numpy as np
from PIL import Image

IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")

def sketch(name, work_w=800, clahe=3.0, sigma=0.9, k=1.6, p=22, eps=-0.06, phi=40, wash_a=0.9):
    """XDoG line art. Local contrast is boosted first (CLAHE) so white-on-white edges still get a line,
    and the lines are found at 800 px wide, then scaled back up, so they stay bold enough on big screens."""
    im = cv2.imread(os.path.join(IMG, name + ".webp"))
    H, W = im.shape[:2]
    if W > work_w:
        im = cv2.resize(im, (work_w, round(H * work_w / W)), interpolation=cv2.INTER_AREA)
    g8 = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    g8 = cv2.createCLAHE(clipLimit=clahe, tileGridSize=(8, 8)).apply(g8)
    g = cv2.bilateralFilter(g8.astype(np.float32) / 255, 7, 0.08, 5)
    g1 = cv2.GaussianBlur(g, (0, 0), sigma)
    g2 = cv2.GaussianBlur(g, (0, 0), sigma * k)
    d = (1 + p) * g1 - p * g2
    e = np.clip(np.where(d >= eps, 1.0, 1 + np.tanh(phi * (d - eps))), 0, 1)
    wash = wash_a + (1 - wash_a) * cv2.GaussianBlur(g, (0, 0), 3)
    t = np.minimum(e, wash)
    if W > work_w:
        t = cv2.resize(t, (W, H), interpolation=cv2.INTER_CUBIC)
    t = np.clip(t, 0, 1)[..., None]
    paper = np.array([233, 229, 226], np.float32)  # RGB
    ink = np.array([38, 42, 48], np.float32)
    rgb = (ink * (1 - t) + paper * t).astype(np.uint8)
    Image.fromarray(rgb).save(os.path.join(IMG, name + "-sketch.webp"), "WEBP", quality=74, method=6)


if __name__ == "__main__":
    for n in sys.argv[1:]:
        sketch(n)
        print("sketched", n)
