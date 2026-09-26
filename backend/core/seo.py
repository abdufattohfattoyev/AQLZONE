"""
SEO — Google va boshqa qidiruv tizimlari uchun sahifa mazmuni.

─────────────────── MUAMMO ───────────────────

Ilova React (SPA): hamma manzilga BIR XIL `index.html` beriladi, mazmunni
JavaScript keyin chizadi. Google birinchi o'qishda bo'sh sahifani ko'radi
va hamma 700 ta dars bitta sarlavha bilan indekslanadi — "kasrlarni
qo'shish" yoki "DTM matematika test" deb izlagan odamga sayt chiqmaydi.

─────────────────── YECHIM ───────────────────

Har manzil uchun server HTML'ning o'ziga qo'yadi:

  * o'z `<title>`, `description`, `canonical` va Open Graph teglari;
  * schema.org (JSON-LD): Course, LearningResource, BreadcrumbList…;
  * `#root` ichida HAQIQIY mazmun: H1, paragraf, bob va darslar
    ro'yxati, ichki havolalar. React ulanganda bu blokni o'zi almashtiradi
    (xuddi yuklanish belgisi kabi) — foydalanuvchi uni bir lahza ko'radi,
    Google esa JS'siz ham to'liq sahifani o'qiydi.

Statik sahifalar ma'lumoti yig'ishda yasaladi (`frontend/scripts/seo.ts`
→ `dist/seo.json`), foydalanuvchi masalalari esa bazadan olinadi.
Ro'yxatda yo'q manzil (profil, sozlamalar, kirish havolasi) `noindex`
bo'ladi — ular shaxsiy yoki bo'sh, qidiruvda chiqmasligi kerak.
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.utils.html import escape

ASOS = "https://aql-zone.uz"
BREND = "Aql Zone"

#: `/masalalar/123` — foydalanuvchi masalasi.
MASALA_YOL = re.compile(r"^/masalalar/(\d+)$")


@lru_cache(maxsize=4)
def _yukla(yol: str, mtime: float) -> dict:
    try:
        return json.loads(Path(yol).read_text("utf-8"))
    except (OSError, ValueError):
        return {}


def malumot() -> dict:
    """`dist/seo.json` — fayl o'zgarsa (yangi yig'ish) qayta o'qiladi."""
    f = Path(settings.FRONTEND_DIST) / "seo.json"
    try:
        return _yukla(str(f), f.stat().st_mtime)
    except OSError:
        return {}


def asos() -> str:
    return (malumot().get("asos") or ASOS).rstrip("/")


def _qisqa(s: str, n: int) -> str:
    s = " ".join(s.split())
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "…"


def sinf_nomi(kod: int) -> str:
    """Masala toifasi kodi (`frontend/src/lib/masalaSinf.ts`) → o'qiladigan nom."""
    if kod == 0:
        return "Maktabgacha"
    if kod == 200:
        return "Kattalar uchun"
    if kod == 201:
        return "Olimpiada"
    if kod >= 300:
        return "Oliy matematika"
    if 107 <= kod <= 110:
        return f"{kod - 100}-sinf geometriya"
    if 7 <= kod <= 10:
        return f"{kod}-sinf algebra"
    return f"{kod}-sinf"


def masala_sahifasi(pk: int) -> dict | None:
    """Tasdiqlangan masala. Javob va yechim QO'YILMAYDI — ular faqat javobdan keyin ochiladi."""
    from .models import Masala

    m = Masala.objects.filter(pk=pk, holat=Masala.TASDIQ).first()
    if m is None:
        return None
    raqam = m.raqam or m.pk
    sinf = sinf_nomi(m.sinf)
    return {
        "sarlavha": f"Masala №{raqam}: {_qisqa(m.matn, 55)} — {sinf} | {BREND}",
        "tavsif": _qisqa(f"{sinf} matematik masala: {m.matn} Yeching va javobingizni tekshiring.", 158),
        "h1": f"Masala №{raqam} · {sinf}",
        "matn": [m.matn],
        "havolalar": [{"yol": "/masalalar", "nom": "Barcha masalalar"}],
        "ld": [{
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": BREND, "item": asos() + "/"},
                {"@type": "ListItem", "position": 2, "name": "Masalalar", "item": asos() + "/masalalar"},
                {"@type": "ListItem", "position": 3, "name": f"Masala №{raqam}", "item": f"{asos()}/masalalar/{m.pk}"},
            ],
        }],
    }


def sahifa(yol: str) -> dict | None:
    yol = "/" + yol.strip("/") if yol.strip("/") else "/"
    s = (malumot().get("sahifalar") or {}).get(yol)
    if s:
        return s
    m = MASALA_YOL.match(yol)
    if m:
        return masala_sahifasi(int(m.group(1)))
    return None


# ------------------------------------------------------------------ HTML


def _meta_almashtir(html: str, nom: str, qiymat: str, xususiyat: str = "name") -> str:
    q = re.compile(rf'<meta {xususiyat}="{re.escape(nom)}" content="[^"]*"\s*/?>')
    teg = f'<meta {xususiyat}="{nom}" content="{escape(qiymat)}" />'
    return q.sub(lambda _: teg, html, count=1) if q.search(html) else html.replace("</head>", f"    {teg}\n  </head>", 1)


def _ld(obj: dict) -> str:
    # `</` JSON ichida `<\/` bo'lishi shart — aks holda matndagi "</script>"
    # skriptni yopib qo'yardi.
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")


def _mazmun(s: dict) -> str:
    """`#root` ichidagi o'qiladigan sahifa — React ulanganda almashtiriladi."""
    q = [f'<h1>{escape(s["h1"])}</h1>']
    q += [f"<p>{escape(p)}</p>" for p in s.get("matn") or []]
    for g in s.get("guruhlar") or []:
        q.append(f'<h2>{escape(g["nom"])}</h2><ul>')
        for x in g["qatorlar"]:
            q.append(f'<li><a href="{escape(x["yol"])}">{escape(x["nom"])}</a></li>' if isinstance(x, dict)
                     else f"<li>{escape(x)}</li>")
        q.append("</ul>")
    if s.get("havolalar"):
        q.append("<nav><ul>" + "".join(
            f'<li><a href="{escape(h["yol"])}">{escape(h["nom"])}</a></li>' for h in s["havolalar"]) + "</ul></nav>")
    return (
        '<main id="az-seo"><header><img src="/logo.svg" alt="Aql Zone" width="48" height="48" />'
        '<a href="/">Aql Zone</a><i></i></header>' + "".join(q) + "</main>"
    )


SEO_USLUB = (
    "<style>#az-seo{max-width:720px;margin:0 auto;padding:20px 18px 48px;"
    "font:16px/1.55 'Baloo 2',system-ui,sans-serif;color:#1a2450}"
    "#az-seo header{display:flex;align-items:center;gap:10px;margin-bottom:12px}"
    "#az-seo header a{font-weight:700;font-size:20px;color:#1a2450;text-decoration:none;flex:1}"
    "#az-seo header i{width:72px;height:4px;border-radius:4px;background:#48c97a;opacity:.7}"
    "#az-seo h1{font-size:26px;line-height:1.2;margin:8px 0 12px}#az-seo h2{font-size:18px;margin:22px 0 6px}"
    "#az-seo ul{padding-left:20px;margin:6px 0}#az-seo a{color:#2c56b8}"
    "#az-seo nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:22px}"
    "</style>"
)


def boyit(html: str, yol: str) -> str:
    """`index.html` ni shu manzilning sarlavhasi, teglari va mazmuni bilan to'ldiradi."""
    s = sahifa(yol)
    if s is None:
        # Shaxsiy yoki dinamik sahifa (profil, sozlamalar, xona) — qidiruvda
        # chiqmasin. Havolalari esa kuzatilaversin.
        html = re.sub(r'\s*<link rel="canonical" href="[^"]*"\s*/?>', "", html, count=1)
        return _meta_almashtir(html, "robots", "noindex, follow")

    toza = "/" + yol.strip("/") if yol.strip("/") else "/"
    kanon = asos() + (s.get("kanonik") or toza)
    html = re.sub(r"<title>[^<]*</title>", f"<title>{escape(s['sarlavha'])}</title>", html, count=1)
    html = _meta_almashtir(html, "description", s["tavsif"])
    html = re.sub(r'<link rel="canonical" href="[^"]*"\s*/?>', f'<link rel="canonical" href="{escape(kanon)}" />', html, count=1)
    html = _meta_almashtir(html, "og:title", s["sarlavha"], "property")
    html = _meta_almashtir(html, "og:description", s["tavsif"], "property")
    html = _meta_almashtir(html, "og:url", kanon, "property")
    ld = "".join(f'<script type="application/ld+json">{_ld(o)}</script>' for o in s.get("ld") or [])
    html = html.replace("</head>", f"    {ld}{SEO_USLUB}\n  </head>", 1)
    # Yuklanish belgisi o'rniga — haqiqiy mazmun (u ham `#root` ichida, React uni almashtiradi).
    return re.sub(r'<div id="az-boshlash">.*?</div>\s*</div>',
                  lambda _: _mazmun(s), html, count=1, flags=re.S)


# ------------------------------------------------------------------ sitemap


def sitemap(request):
    """Barcha ochiq sahifalar va tasdiqlangan masalalar."""
    from .models import Masala

    a = asos()
    qator = []
    for yol, s in (malumot().get("sahifalar") or {}).items():
        if s.get("muhim") and not s.get("kanonik"):
            qator.append(f"<url><loc>{escape(a + yol)}</loc><priority>{s['muhim']:.1f}</priority></url>")
    for pk, sana in (Masala.objects.filter(holat=Masala.TASDIQ)
                     .order_by("-pk").values_list("pk", "created_at")[:20000]):
        qator.append(f"<url><loc>{a}/masalalar/{pk}</loc><lastmod>{sana.date().isoformat()}</lastmod>"
                     "<priority>0.5</priority></url>")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(qator) + "</urlset>")
    javob = HttpResponse(xml, content_type="application/xml; charset=utf-8")
    javob["Cache-Control"] = "public, max-age=3600"
    return javob


def robots(request):
    matn = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /boshqaruv\n"
        "Disallow: /kirish/\n"
        "Disallow: /xona/\n"
        "Disallow: /duel/\n"
        f"\nSitemap: {asos()}/sitemap.xml\n"
    )
    javob = HttpResponse(matn, content_type="text/plain; charset=utf-8")
    javob["Cache-Control"] = "public, max-age=86400"
    return javob
