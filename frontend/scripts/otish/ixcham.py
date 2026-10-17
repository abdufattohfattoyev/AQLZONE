"""ball.json + fan.json → frontend/src/lib/data/otish2025.json (faqat matematikali yo'nalishlar)."""
import json, re, sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
D = Path(sys.argv[1])
OUT = Path(sys.argv[2])
ball = json.loads((D / "ball.json").read_text(encoding="utf-8"))
fan = json.loads((D / "fan.json").read_text(encoding="utf-8"))


def toza(s):
    s = re.sub(r"\s+", " ", s.replace("`", "'").replace("‘", "'").replace("’", "'").replace("ʻ", "'")).strip()
    return s


idx = {k: [] for k in ("otm", "hudud", "tur", "til")}


def ix(k, v):
    v = toza(v)
    if v not in idx[k]:
        idx[k].append(v)
    return idx[k].index(v)


q, kor = [], set()
yoq = Counter()
for x in ball:
    f = fan.get(str(x["mvdir"]))
    if not f:
        yoq[x["nomi"]] += 1
        continue
    gr, con = float(x.get("gr_b") or 0), float(x.get("con_b") or 0)
    if gr <= 0 and con <= 0:
        continue
    kalit = (x["otm"], x["tur"], x["til"], x["mvdir"])
    if kalit in kor:
        continue
    kor.add(kalit)
    q.append([ix("otm", x["otm"]), ix("hudud", x["hudud"]), ix("tur", x["tur"]), ix("til", x["til"]),
              int(x["mvdir"]), toza(x["nomi"]), round(gr, 1), round(con, 1), f["orin"]])

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"manba": "UZBMB mandat.uzbmb.uz BallVuz2025; fanlar: infoedu.uz 2025/2026",
                           **idx, "q": q}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("jami qator:", len(ball), "| matematikali:", len(q), "| OTM:", len(idx["otm"]),
      "| tur:", idx["tur"], "| til:", idx["til"], "| hajm:", OUT.stat().st_size)
print("orin:", Counter(r[8] for r in q))
print("namuna:", [r for r in q if "Dasturiy" in r[5]][:3])
