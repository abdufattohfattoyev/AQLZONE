"""O'tish ballari 2025 (mandat.uzbmb.uz, ochiq) + matematikali fanlar majmuasi (infoedu.uz)."""
import html, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}
B = "https://mandat.uzbmb.uz/BallVuz2025/"


def post(yol, **d):
    for urinish in range(4):
        try:
            req = urllib.request.Request(B + yol, data=urllib.parse.urlencode(d).encode(), headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                time.sleep(0.25)
                return json.load(r)
        except Exception as e:
            print("  qayta", yol, d, e, flush=True)
            time.sleep(2 + urinish * 3)
    return []


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read().decode("utf-8")


# --- fanlar majmuasi: matematika 1-fan (3,1) yoki 2-fan (2,1) ---
MAJMUA = {
    1: ["matematika-va-fizika", "matematika-va-chet-tili", "matematika-va-geografiya",
        "matematika-va-ona-tili-va-adabiyoti"],
    2: ["fizika-va-matematika", "geografiya-va-matematika", "kimyo-va-matematika",
        "ona-tili-va-adabiyoti-va-matematika", "tarix-va-matematika"],
}
fan = {}
for orin, slaglar in MAJMUA.items():
    for slug in slaglar:
        s = get(f"https://infoedu.uz/fanlar/{slug}")
        t = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S)
        satr = [l.strip() for l in html.unescape(re.sub(r"<[^>]+>", "\n", t)).splitlines() if l.strip()]
        n = 0
        for i, l in enumerate(satr):
            if re.fullmatch(r"\d{8}", l):
                fan[l] = {"orin": orin, "majmua": slug}
                n += 1
        print(slug, n, flush=True)
(OUT / "fan.json").write_text(json.dumps(fan, ensure_ascii=False, indent=0), encoding="utf-8")

# --- o'tish ballari ---
hudud_html = get("https://mandat.uzbmb.uz/BallVuz2025")
hududlar = [(v, html.unescape(n).strip()) for v, n in
            re.findall(r'<option value="(\d+)"[^>]*>([^<]+)', hudud_html) if v != "0"]
qator = []
for rid, rnom in hududlar:
    for u in post("GetUniversities", RegionID=rid):
        turlar = post("GetTypes", UniversityID=u["value"])
        tillar = post("GetLangs", UniversityID=u["value"])
        for tur in turlar:
            for til in tillar:
                for x in post("GetAll", RegionID=rid, UniversityID=u["value"], EdTypeID=tur["value"],
                              EdLangID=til["value"]):
                    qator.append({"hudud": rnom, "otm_id": int(u["value"]), "otm": u["text"].strip(),
                                  "tur": tur["text"].strip(), "til": til["text"].strip(), **x})
        print(rnom, "|", u["text"][:50], len(qator), flush=True)
(OUT / "ball.json").write_text(json.dumps(qator, ensure_ascii=False), encoding="utf-8")
print("TAYYOR", len(qator))
