"""
Logo SVG'laridan PNG yasaydi — Edge headless orqali, shaffof fonda.

Nega brauzer: SVG'da gradient, stroke-linejoin va <text> (Fredoka shrifti)
bor; PIL ularni chiza olmaydi, cairosvg esa o'rnatilmagan. Edge esa
saytdagi bilan AYNAN bir xil chizadi.

    python .logo/png_yasa.py
"""
import re
import subprocess
import tempfile
from pathlib import Path

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
LOYIHA = Path(__file__).resolve().parent.parent
PUBLIC = LOYIHA / "frontend" / "public"
CHIQISH = LOYIHA / ".logo" / "png"

SHRIFT = ('<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700'
          '&family=Baloo+2:wght@700;800&display=block" rel="stylesheet">')


def yasa(svg: Path, chiqish: Path, en: int, boy: int, fon: str = "transparent") -> None:
    """SVG'ni en x boy PNG'ga chizadi."""
    # O'lcham FAQAT <svg> tegidan olinadi: ichidagi plitka (`<rect width="120"
    # height="120">`) ham xuddi shu atributlarga ega va ular o'chsa plitka
    # yo'qolib, PNG fonsiz chiqardi.
    matn = svg.read_text(encoding="utf-8")
    bosh, qolgan = matn.split(">", 1)
    bosh = re.sub(r'\s(width|height)="\d+"', "", bosh)
    html = f"""<!doctype html><html><head><meta charset="utf-8">{SHRIFT}
<style>html,body{{margin:0;background:{fon};}}
svg{{display:block;width:{en}px;height:{boy}px}}</style></head>
<body>{bosh}>{qolgan}</body></html>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
        yol = Path(f.name)
    chiqish.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--default-background-color=00000000", "--force-device-scale-factor=1",
        "--virtual-time-budget=4000",               # shrift yuklanishiga vaqt
        f"--window-size={en},{boy}", f"--screenshot={chiqish}", yol.as_uri(),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    yol.unlink(missing_ok=True)
    print(chiqish.relative_to(LOYIHA), en, "x", boy)


def og(chiqish: Path) -> None:
    """Ulashish rasmi (Telegram/Facebook havola oldi-ko'rinishi) — 1200x630."""
    belgi = (PUBLIC / "logo.svg").read_text(encoding="utf-8")
    bosh, qolgan = belgi.split(">", 1)
    belgi = re.sub(r'\s(width|height)="\d+"', "", bosh) + ">" + qolgan
    html = f"""<!doctype html><html><head><meta charset="utf-8">{SHRIFT}<style>
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{background:radial-gradient(900px 520px at 85% -10%,#155e66 0%,transparent 60%),
  radial-gradient(700px 420px at 0% 110%,#3a2a12 0%,transparent 60%),#0d1b20;
  font-family:'Baloo 2','Fredoka',sans-serif;color:#fff;display:flex;align-items:center;gap:64px;padding:0 90px;box-sizing:border-box}}
.belgi{{width:270px;height:270px;flex:none;filter:drop-shadow(0 30px 60px rgb(23 179 193 / .45))}}
.belgi svg{{width:100%;height:100%;display:block}}
h1{{font:700 96px/1 Fredoka,sans-serif;margin:0;letter-spacing:-1px}}
h1 span{{color:#2cc6d4}}
p{{font-weight:700;font-size:34px;line-height:1.28;color:#c8ecf1;margin:18px 0 30px}}
.chip{{display:inline-block;padding:12px 26px;border-radius:999px;background:rgb(255 255 255 / .1);
  font-weight:800;font-size:26px;margin-right:12px}}
.chip.b{{background:#d97706;color:#fff}}
</style></head><body>
<div class="belgi">{belgi}</div>
<div><h1>Aql <span>Zone</span></h1>
<p>Matematika: 1–11-sinf darslari,<br>DTM va Milliy sertifikat testlari</p>
<span class="chip">Algebra</span><span class="chip">Geometriya</span><span class="chip">O'yinlar</span><span class="chip b">Bepul</span>
</div></body></html>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
        yol = Path(f.name)
    subprocess.run([
        EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
        "--virtual-time-budget=4000", "--window-size=1200,630", f"--screenshot={chiqish}", yol.as_uri(),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    yol.unlink(missing_ok=True)
    print(chiqish.relative_to(LOYIHA), "1200 x 630")


if __name__ == "__main__":
    og(PUBLIC / "og.png")
    belgi = PUBLIC / "logo.svg"
    # Sayt va telefon ikonkalari
    yasa(belgi, PUBLIC / "logo-180.png", 180, 180)
    yasa(belgi, PUBLIC / "logo-512.png", 512, 512)
    yasa(PUBLIC / "logo-maskable.svg", PUBLIC / "logo-maskable-512.png", 512, 512)
    # Kanal, reklama va videolar uchun — eng yuqori sifat
    yasa(belgi, CHIQISH / "aqlzone-belgi-2048.png", 2048, 2048)
    yasa(PUBLIC / "logo-toliq.svg", CHIQISH / "aqlzone-toliq-2400.png", 2400, 1800)
    yasa(PUBLIC / "logo-toliq.svg", CHIQISH / "aqlzone-toliq-oq-fon-2400.png", 2400, 1800, fon="#ffffff")
    # Videolar (`.rolik/zavod/montaj.py` → logo_im)
    yasa(PUBLIC / "logo-toliq.svg", LOYIHA / ".rolik" / "brend" / "logo-toliq.png", 2400, 1800)
