from pathlib import Path

from PIL import Image


SOURCE = Path(
    r"C:\Users\大头男孩\Documents\xwechat_files\wxid_n24sfntf4m0j11_4b5d\temp\RWTemp"
    r"\2026-08\9e20f478899dc29eb19741386f9343c8\37e5a107ff2dcaaf6223181f6e3fa259.jpg"
)
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "contact" / "wechat-qr.png"


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")

    # The QR modules occupy approximately x=144..745 and y=312..913.
    # Keep 30px of the original white quiet zone on every side.
    crop = source.crop((114, 282, 776, 944))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUTPUT, format="PNG", optimize=True)
    print(f"{OUTPUT} {crop.size}")


if __name__ == "__main__":
    main()
