from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE = Path(
    r"C:\Users\大头男孩\.codex\generated_images\019ff8ef-3f1d-7641-8663-673d84dce56a"
    r"\exec-327967b5-90df-43a5-a8b4-e114d297cc84.png"
)
ASSETS = ROOT / "public" / "hero" / "design-in-bloom"
OUTPUT = ROOT / "design-previews" / "contact-modal-existing-assets.png"


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((width, height), Image.Resampling.LANCZOS)
    return copy


def place(
    canvas: Image.Image,
    image: Image.Image,
    xy: tuple[int, int],
    *,
    angle: float = 0,
    mirror: bool = False,
    opacity: float = 1,
) -> None:
    layer = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if mirror else image.copy()
    if angle:
        layer = layer.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    if opacity < 1:
        alpha = layer.getchannel("A").point(lambda value: round(value * opacity))
        layer.putalpha(alpha)
    canvas.alpha_composite(layer, xy)


def main() -> None:
    canvas = Image.open(BASE).convert("RGBA")
    bee = Image.open(ASSETS / "bee.png").convert("RGBA")
    bouquet = Image.open(ASSETS / "flower.png").convert("RGBA")
    flower = Image.open(ASSETS / "flower-sprite.png").convert("RGBA")

    # Modal bounds in the generated reference are approximately
    # x=385..1230 and y=239..723. Decorations lightly cross these edges.
    place(canvas, contain(bouquet, 205, 230), (272, 696), angle=-7, opacity=0.94)
    place(canvas, contain(flower, 92, 92), (1202, 184), angle=13, opacity=0.96)
    place(canvas, contain(flower, 62, 62), (338, 214), angle=-18, opacity=0.9)

    place(canvas, contain(bee, 62, 60), (427, 193), angle=-11, opacity=0.96)
    place(canvas, contain(bee, 53, 52), (1200, 674), angle=17, mirror=True, opacity=0.96)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT, quality=95, optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
