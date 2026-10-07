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
from datetime import UTC, datetime
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


def masalalar_royxati() -> list[dict]:
    """`/masalalar` uchun: tasdiqlangan masalalarga HAVOLALAR, sinf bo'yicha.

    Usiz Google masalalarni faqat sitemap orqali topardi — sahifadan
    sahifaga o'tadigan havola bo'lmagani uchun ular "yetim" hisoblanadi
    va sekin, ba'zan umuman indekslanmaydi.
    """
    from .models import Masala

    guruh: dict[str, list[dict]] = {}
    for pk, raqam, sinf, matn in (Masala.objects.filter(holat=Masala.TASDIQ).order_by("sinf", "-pk")
                                  .values_list("pk", "raqam", "sinf", "matn")[:500]):
        guruh.setdefault(sinf_nomi(sinf), []).append(
            {"yol": f"/masalalar/{pk}", "nom": f"№{raqam or pk}. {_qisqa(matn, 90)}"})
    return [{"nom": nom, "qatorlar": q} for nom, q in guruh.items()]


def _toza(yol: str) -> str:
    return "/" + yol.strip("/") if yol.strip("/") else "/"


def sahifa(yol: str) -> dict | None:
    yol = _toza(yol)
    s = (malumot().get("sahifalar") or {}).get(yol)
    if s:
        if yol == "/masalalar":
            s = {**s, "guruhlar": masalalar_royxati()}
        return s
    m = MASALA_YOL.match(yol)
    if m:
        return masala_sahifasi(int(m.group(1)))
    return None


# ------------------------------------------------------------------ 404


@lru_cache(maxsize=4)
def _qoliplar(yollar: tuple[str, ...]) -> tuple[re.Pattern, ...]:
    """React marshrutlari (`/kurs/:slug/:bob/:dars`) → regex."""
    return tuple(re.compile("^" + re.sub(r":[a-z]+", r"[^/]+", re.escape(y).replace(r"\:", ":")) + "$")
                 for y in yollar if y != "*")


def mavjud(yol: str) -> bool:
    """Bu manzilda ilovada sahifa bormi.

    Bo'lmasa server 404 qaytaradi (sahifa ko'rinishi o'sha-o'sha: React
    o'zining "topilmadi" ekranini chizadi). Aks holda har qanday xato
    havola 200 bilan bosh sahifani berardi va Google uni "Soft 404"
    deb belgilab, nusxa sahifa sifatida hisoblardi.

    Marshrutlar ro'yxati `App.tsx` dan yig'ishda olinadi (`seo.ts`).
    Ro'yxat yo'q bo'lsa (eski yig'ish) — hamma manzil ochiq, avvalgidek.
    """
    d = malumot()
    yollar, kurslar = d.get("yollar"), set(d.get("kurslar") or [])
    if not yollar:
        return True
    yol = _toza(yol)
    if yol in (d.get("sahifalar") or {}):
        return True
    if yol == "/ru" or yol.startswith("/ru/"):
        yol = _toza(yol[3:])
    k = re.match(r"^/kurs/([^/]+)", yol)
    if k and kurslar and k.group(1) not in kurslar:
        return False
    return any(q.match(yol) for q in _qoliplar(tuple(yollar)))


# ------------------------------------------------------------------ HTML


def _meta_almashtir(html: str, nom: str, qiymat: str, xususiyat: str = "name") -> str:
    q = re.compile(rf'<meta {xususiyat}="{re.escape(nom)}" content="[^"]*"\s*/?>')
    teg = f'<meta {xususiyat}="{nom}" content="{escape(qiymat)}" />'
    return q.sub(lambda _: teg, html, count=1) if q.search(html) else html.replace("</head>", f"    {teg}\n  </head>", 1)


def _html_atribut(html: str, nom: str, qiymat: str) -> str:
    """`<html ...>` tegidagi atributni qo'yadi yoki almashtiradi."""
    def qoy(m: re.Match) -> str:
        teg = re.sub(rf'\s{re.escape(nom)}="[^"]*"', "", m.group(0))
        return f'<html {nom}="{qiymat}"' + teg[len("<html"):]
    return re.sub(r"<html\b[^>]*>", qoy, html, count=1)


def _ld(obj: dict) -> str:
    # `</` JSON ichida `<\/` bo'lishi shart — aks holda matndagi "</script>"
    # skriptni yopib qo'yardi.
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")


def _mazmun(s: dict) -> str:
    """`#root` ichidagi o'qiladigan sahifa — React ulanganda almashtiriladi."""
    q = [f'<h1>{escape(s["h1"])}</h1>']
    q += [f"<p>{escape(p)}</p>" for p in s.get("matn") or []]
    # Nomli formulalar. Formula — sahifaning eng qidirilgan qismi
    # ("kvadratlar ayirmasi formulasi"), shuning uchun u matndan keyin
    # darhol va alohida turadi, paragraf ichida yashirinmaydi.
    if s.get("formulalar"):
        q.append(f'<h2>{escape(s.get("formula_sarlavha") or "Formulalar")}</h2><ul class="az-f">')
        for f in s["formulalar"]:
            nom = f"<span>{escape(f['n'])}</span>" if f.get("n") else ""
            q.append(f'<li>{nom}<code>{escape(f["f"])}</code></li>')
        q.append("</ul>")
    if s.get("qadamlar"):
        q.append(f'<h2>{escape(s.get("qadam_sarlavha") or "Yechish tartibi")}</h2><ol>'
                 + "".join(f"<li>{escape(x)}</li>" for x in s["qadamlar"]) + "</ol>")
    if s.get("misollar"):
        q.append(f'<h2>{escape(s.get("misol_sarlavha") or "Namunaviy savollar")}</h2><ol class="az-misol">')
        for m in s["misollar"]:
            q.append(f'<li><p>{escape(m["s"])}</p>')
            if m.get("k"):
                q.append(f'<p class="az-k">{escape(m["k"])}</p>')
            if m.get("v"):
                q.append("<p>" + " · ".join(escape(str(v)) for v in m["v"]) + "</p>")
            q.append(f'<details><summary>{escape(m.get("jt") or "Javob")}</summary><p><b>{escape(str(m["j"]))}</b></p>')
            if m.get("y"):
                q.append("<ol>" + "".join(f"<li>{escape(y)}</li>" for y in m["y"]) + "</ol>")
            q.append("</details></li>")
        q.append("</ol>")
    # Bitta jadval (`jadval`) yoki bir nechtasi (`jadvallar`) — ma'lumotnoma
    # sahifalarida ikkinchisi kerak: Rim raqamlarida birliklar, o'nliklar va
    # yuzliklar alohida jadval bo'ladi.
    for j in ([s["jadval"]] if s.get("jadval") else []) + list(s.get("jadvallar") or []):
        q.append(f'<h2>{escape(j["nom"])}</h2><div class="az-j"><table><thead><tr>'
                 + "".join(f"<th>{escape(str(x))}</th>" for x in j["bosh"]) + "</tr></thead><tbody>"
                 + "".join("<tr>" + "".join(f"<td>{escape(str(x))}</td>" for x in r) + "</tr>" for r in j["qatorlar"])
                 + "</tbody></table></div>")
    if s.get("xatolar"):
        q.append(f'<h2>{escape(s.get("xato_sarlavha") or "Tipik xatolar")}</h2><ul>'
                 + "".join(f"<li>{escape(x)}</li>" for x in s["xatolar"]) + "</ul>")
    # Savol-javob. Shakli `misollar` bilan bir xil (ochiladigan `details`),
    # lekin mazmuni boshqa: bu masala emas, o'quvchi qidiruvga yozadigan
    # savolning javobi. JSON-LD da ham `FAQPage` bo'lib ketadi.
    if s.get("savollar"):
        q.append(f'<h2>{escape(s.get("savol_sarlavha") or "Savol va javob")}</h2><div class="az-sj">')
        for x in s["savollar"]:
            q.append(f'<details><summary>{escape(x["s"])}</summary><p>{escape(x["j"])}</p></details>')
        q.append("</div>")
    if s.get("tugma"):
        q.append(f'<p><a class="az-tugma" href="{escape(s["tugma"]["yol"])}">{escape(s["tugma"]["nom"])}</a></p>')
    for g in s.get("guruhlar") or []:
        q.append(f'<h2>{escape(g["nom"])}</h2><ul>')
        for x in g["qatorlar"]:
            q.append(f'<li><a href="{escape(x["yol"])}">{escape(x["nom"])}</a></li>' if isinstance(x, dict)
                     else f"<li>{escape(x)}</li>")
        q.append("</ul>")
    if s.get("havolalar"):
        q.append("<nav><ul>" + "".join(
            f'<li><a href="{escape(h["yol"])}">{escape(h["nom"])}</a></li>' for h in s["havolalar"]) + "</ul></nav>")
    # Tepadagi havola SAHIFANING TILIGA mos bosh sahifaga boradi. Statik
    # sahifada (lug'at, ma'lumotnoma) React ulanmaydi, ya'ni bu yagona
    # "orqaga" yo'li: ruscha sahifadan o'zbekcha bosh sahifaga olib
    # borilsa, odam tilni qo'lda qaytarishga majbur bo'lardi.
    uy = "/ru" if s.get("til") == "ru" else "/"
    return (
        '<main id="az-seo"><header><img src="/logo.svg" alt="Aql Zone" width="48" height="48" />'
        f'<a href="{uy}">Aql Zone</a><i></i></header>' + "".join(q) + "</main>"
    )


SEO_USLUB = (
    "<style>#az-seo{max-width:720px;margin:0 auto;padding:20px 18px 48px;"
    "font:16px/1.55 'Baloo 2',system-ui,sans-serif;color:#1a2450}"
    "#az-seo header{display:flex;align-items:center;gap:10px;margin-bottom:12px}"
    "#az-seo header a{font-weight:700;font-size:20px;color:#1a2450;text-decoration:none;flex:1}"
    "#az-seo header i{width:72px;height:4px;border-radius:4px;background:#48c97a;opacity:.7}"
    "#az-seo h1{font-size:26px;line-height:1.2;margin:8px 0 12px}#az-seo h2{font-size:18px;margin:22px 0 6px}"
    # Ro'yxat belgilari ATAYLAB qaytariladi: ilova uslublari (Tailwind
    # preflight) `ul`/`ol` dan belgini olib tashlaydi — ilovada hamma
    # ro'yxat o'z ko'rinishiga ega. Bu yerda esa oddiy matn turadi va
    # belgisiz "yechish tartibi" qadamlari oddiy abzasga aylanadi: qaysi
    # qadam birinchi ekani ko'rinmaydi.
    "#az-seo ul{padding-left:20px;margin:6px 0;list-style:disc}"
    "#az-seo ol{padding-left:22px;margin:6px 0;list-style:decimal}"
    "#az-seo li{margin:2px 0}#az-seo a{color:#2c56b8}"
    "#az-seo nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:22px}"
    ".az-misol>li{margin:0 0 14px}.az-misol p{margin:4px 0}.az-k{font-size:20px;font-weight:700}"
    "#az-seo summary{cursor:pointer;color:#2c56b8}.az-j{overflow-x:auto}"
    # Formula ro'yxati: nomi yupqa, formulaning o'zi qalin va bir xil
    # kenglikdagi shriftda — ko'z uni matndan ajratib oladi.
    # `#az-seo` bilan: yuqoridagi umumiy `ul` qoidasi id bilan yozilgan,
    # ya'ni oddiy sinf undan kuchsiz bo'lib, formula ro'yxatiga ham belgi
    # qo'yib yuborardi.
    "#az-seo .az-f{list-style:none;padding:0}#az-seo .az-f>li{margin:0 0 8px}"
    ".az-f span{display:block;font-size:14px;opacity:.75}"
    ".az-f code{font:600 17px/1.5 ui-monospace,'Cascadia Code',Consolas,monospace}"
    ".az-sj details{margin:0 0 8px}.az-sj summary{font-weight:600}"
    "#az-seo table{border-collapse:collapse;font-variant-numeric:tabular-nums}"
    "#az-seo td,#az-seo th{border:1px solid #d6dcef;padding:4px 8px;text-align:center}#az-seo th{background:#eef2fb}"
    ".az-tugma{display:inline-block;margin-top:14px;padding:12px 22px;border-radius:14px;background:#48c97a;"
    "color:#fff!important;font-weight:700;text-decoration:none}"
    # Qora rejim (`index.html` `data-yoruglik` ni React'dan oldin qo'yadi):
    # usiz to'q matn to'q fonda deyarli ko'rinmasdi.
    "html[data-yoruglik=qora] #az-seo,html[data-yoruglik=qora] #az-seo header a{color:#e6eaff}"
    "html[data-yoruglik=qora] #az-seo a,html[data-yoruglik=qora] #az-seo summary{color:#8fb4ff}"
    "html[data-yoruglik=qora] #az-seo td,html[data-yoruglik=qora] #az-seo th{border-color:#34406b}"
    "html[data-yoruglik=qora] #az-seo th{background:#1f2a4d}"
    # Mazmun ROBOT uchun. JS ishlaydigan brauzerda (`index.html` boshida
    # `data-js` qo'yiladi) u yashirin: aks holda yangilashda matn bir
    # lahza chiqib, React uni almashtirganda yo'qolardi. O'rniga oddiy
    # yuklanish belgisi turadi. Statik sahifada React ulanmaydi — u yerda
    # aksincha, mazmun ko'rinadi va belgi yashiriladi.
    "html[data-js]:not([data-statik]) #az-seo{display:none}"
    "html:not([data-js]) #az-boshlash,html[data-statik] #az-boshlash{display:none}"
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
    # Tillararo juftlik: Google ruscha qidiruvda `/ru/...` ni, o'zbekchada
    # asosiysini ko'rsatadi va ularni bir-birining nusxasi deb hisoblamaydi.
    muqobil = "".join(f'<link rel="alternate" hreflang="{t}" href="{escape(asos() + y)}" />'
                      for t, y in (s.get("muqobil") or {}).items())
    if s.get("muqobil", {}).get("uz"):
        muqobil += f'<link rel="alternate" hreflang="x-default" href="{escape(asos() + s["muqobil"]["uz"])}" />'
    html = html.replace("</head>", f"    {muqobil}{ld}{SEO_USLUB}\n  </head>", 1)
    if s.get("til") == "ru":
        html = _meta_almashtir(html, "og:locale", "ru_RU", "property")
        html = _html_atribut(html, "lang", "ru")
    if s.get("statik"):
        # Faqat server sahifasi — ilovada unga mos ekran yo'q. React
        # ulanmaydi (`main.tsx`), aks holda u "topilmadi" chizardi.
        html = _html_atribut(html, "data-statik", "1")
    # Yuklanish belgisidan KEYIN — haqiqiy mazmun (ikkalasi ham `#root`
    # ichida, React ularni almashtiradi). Qaysi biri ko'rinishini
    # `SEO_USLUB` oxiridagi qoida hal qiladi.
    return re.sub(r'<div id="az-boshlash">.*?</div>\s*</div>',
                  lambda m: m.group(0) + _mazmun(s), html, count=1, flags=re.S)


# ------------------------------------------------------------------ sitemap


#: Sitemap bo'limlari. Hammasi bitta faylga sig'adi (chegara 50 000 manzil),
#: lekin bo'lib berilgani Search Console'da MUHIM: u indekslanish hisobotini
#: har sitemap uchun alohida ko'rsatadi. Bitta fayl bo'lsa, "2000 sahifadan
#: 1200 tasi indekslangan" deb yozadi va qaysi bo'lim tushmaganini aytmaydi —
#: lug'at indekslanmayaptimi yoki masalalar, bilib bo'lmaydi.
BOLIMLAR = ("asosiy", "darslar", "lugat", "masalalar")


def _bolim(yol: str) -> str:
    """Manzil qaysi sitemapga tushadi."""
    t = yol[3:] if yol == "/ru" or yol.startswith("/ru/") else yol
    if t.startswith("/lugat"):
        return "lugat"
    if t.startswith("/kurs/"):
        return "darslar"
    return "asosiy"


def _javob(xml: str, soat: int = 1):
    javob = HttpResponse('<?xml version="1.0" encoding="UTF-8"?>\n' + xml,
                         content_type="application/xml; charset=utf-8")
    javob["Cache-Control"] = f"public, max-age={soat * 3600}"
    return javob


def _yigish_sanasi() -> str:
    """`seo.json` o'zgargan kun — statik sahifalarning `lastmod` i.

    Sahifa matni yig'ishda yasaladi, ya'ni u aynan shu kuni o'zgargan.
    Usiz Google minglab sahifani qachon qayta ko'rishni taxmin bilan hal
    qilardi va yangi bo'lim bir necha hafta kutib qolardi.
    """
    f = Path(settings.FRONTEND_DIST) / "seo.json"
    try:
        return datetime.fromtimestamp(f.stat().st_mtime, tz=UTC).date().isoformat()
    except OSError:
        return datetime.now(tz=UTC).date().isoformat()


def sitemap(request):
    """Sitemap indeksi — bo'limlarga havola."""
    a = asos()
    sana = _yigish_sanasi()
    return _javob(
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(f"<sitemap><loc>{a}/sitemap-{b}.xml</loc><lastmod>{sana}</lastmod></sitemap>"
                 for b in BOLIMLAR)
        + "</sitemapindex>", soat=24)


def sitemap_bolim(request, bolim: str):
    """Bitta bo'lim manzillari."""
    from django.http import Http404

    from .models import Masala

    if bolim not in BOLIMLAR:
        raise Http404
    a = asos()
    qator = []
    if bolim == "masalalar":
        for pk, sana in (Masala.objects.filter(holat=Masala.TASDIQ)
                         .order_by("-pk").values_list("pk", "created_at")[:40000]):
            qator.append(f"<url><loc>{a}/masalalar/{pk}</loc><lastmod>{sana.date().isoformat()}</lastmod>"
                         "<priority>0.5</priority></url>")
    else:
        sana = _yigish_sanasi()
        for yol, s in (malumot().get("sahifalar") or {}).items():
            if not s.get("muhim") or s.get("kanonik") or _bolim(yol) != bolim:
                continue
            qator.append(f"<url><loc>{escape(a + yol)}</loc><lastmod>{sana}</lastmod>"
                         f"<priority>{s['muhim']:.1f}</priority></url>")
    return _javob('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                  + "".join(qator) + "</urlset>")


def robots(request):
    # Shaxsiy va bir martalik manzillar yopiladi: ular qidiruvda chiqmasligi
    # kerak (profil, xona kodi, duel havolasi) va robot ularni aylanib
    # yurgan vaqtida HAQIQIY sahifalarni ko'rmaydi.
    #
    # DIQQAT: bu yerga yozilgan manzilni Google UMUMAN o'qimaydi, ya'ni
    # undagi `noindex` ni ham ko'rmaydi. Shuning uchun faqat hech qachon
    # indekslanmasligi kerak bo'lgan bo'limlar yoziladi; qolgan shaxsiy
    # sahifalar `noindex` bilan qoladi (`boyit`).
    matn = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /boshqaruv\n"
        "Disallow: /kirish/\n"
        "Disallow: /xona/\n"
        "Disallow: /duel/\n"
        "Disallow: /sinf/qoshil/\n"
        "Disallow: /masalalar/menikilar\n"
        "Disallow: /men\n"
        "Disallow: /sozlamalar\n"
        # Qidiruv natijasi sahifasi: har xil `?s=` bilan cheksiz ko'p
        # manzil beradi va ularning hammasi ichki havolalardan tuzilgan
        # bo'sh ro'yxat. Google buni "cheksiz bo'shliq" deb biladi.
        "Disallow: /qidiruv\n"
        f"\nSitemap: {asos()}/sitemap.xml\n"
    )
    javob = HttpResponse(matn, content_type="text/plain; charset=utf-8")
    javob["Cache-Control"] = "public, max-age=86400"
    return javob
