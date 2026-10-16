"""
`manage.py jonli_dars <slug> [--soni 4] [--chiqish fayl.json] [--ovozsiz]`

Bitta DTM mavzusi bo'yicha JONLI DARSLAR yasaydi (`frontend/src/lib/jonliDars.ts`):

  1. REJA — model mavzuni DTM talabiga ko'ra `--soni` ta darsga bo'ladi.
  2. DARS — har biri sahnalar JSON i: ovozda o'qiladigan matn, doska
     qatorlari, chizma (`ai.CHIZMA` tili) va 2–3 savol.
  3. TEKSHIRUV — ikkinchi chaqiruv darsni o'quvchi emas, imtihonchi
     ko'zi bilan o'qiydi: hisob, formula, savolning to'g'ri javobi.
     Xato topilsa — dars izoh bilan qayta yasaladi (ko'pi bilan 2 marta).
  4. OVOZ — har sahna bo'laklarga bo'linadi (mijozdagi `ovozBolaklari`
     bilan AYNAN bir xil qoida) va Aisha'da yasaladi. Kesh abadiy:
     qayta yurgizilsa, tayyor bo'laklarga pul ketmaydi.

Natija — JSON fayl; u `frontend/public/darslar/<slug>.json` ga ko'chirilib
commit qilinadi (darslar o'qib chiqiladi va tahrirlanadi). Kalit faqat
serverda bo'lgani uchun buyruq serverdagi konteynerda yurgiziladi.
"""
from __future__ import annotations

import json
import re

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core import ai_reja

TIZIM = """Sen — DTM matematika bo'yicha tajribali o'qituvchi va metodistsan. \
O'zbek tilida (lotin yozuvida) yozasan. Javobing FAQAT bitta to'g'ri JSON obyekt."""

REJA_SOROV = """Mavzu: "{nom}" (DTM matematika). Uni {soni} ta ketma-ket darsga bo'l: \
oddiydan murakkabga, har dars bitta aniq ko'nikma beradi, oxirgisi — DTM dagi \
murakkab va aralash savollar. JSON: {{"darslar":[{{"n":1,"nom":"...","maqsad":"bir gap: \
dars oxirida o'quvchi nimani qila oladi"}}]}}"""

DARS_SOROV = """Mavzu: "{nom}". Kurs rejasi:
{reja}

Endi {n}-darsni to'liq yoz: "{dars_nom}" — {maqsad}

Bu dars ekranda "jonli doska" bo'lib ko'rsatiladi: har sahnada doskada 1–4 \
qator yozuv va (kerak bo'lsa) chizma chiqadi, ovoz esa "aytish" matnini o'qiydi. \
Video darsdek tushuntir: sabab bilan, misol bilan, o'quvchiga murojaat qilib.

JSON:
{{"n":{n},"nom":"{dars_nom}","maqsad":"{maqsad}","sahnalar":[
 {{"aytish":"...","yozuv":["...","..."],"chizma":null}},
 {{"aytish":"...","savol":{{"matn":"...","variantlar":["...","...","...","..."],"togri":0,"izoh":"..."}}}}
]}}

Qoidalar:
- 9–14 sahna. Tartib: kirish (nega kerak) → qoida/formula → chizma bilan tushuntirish → \
2–3 ta yechilgan misol (har biri 1–3 sahna, qadam-baqadam) → tipik xato → 2–3 savol \
(o'rtada va oxirida) → qisqa xulosa.
- "aytish" — OVOZ uchun: FAQAT so'zlar va raqamlar. Belgilar yozma: =, +, ^, √, /, π, \
°, ², <, > o'rniga "teng", "plyus", "kvadrat", "ildiz ostida", "bo'lingan", "pi", \
"gradus", "kichik" kabi so'zlar. Bir sahnada 1–4 gap, har gap 180 belgidan qisqa.
- "yozuv" — DOSKA uchun: qisqa qatorlar, formulalar x², √(x+1), π/6, sin x = 1/2, \
≤ kabi. LaTeX yo'q. Har qator 60 belgigacha.
- "chizma" — kerak bo'lsa quyidagi qoidaga ko'ra, aks holda null:
{chizma}
- Savolda 4 variant, "togri" — to'g'ri variant indeksi (0–3), javobni o'zing \
hisoblab tekshir; "izoh" — nega shunday, 1–2 gap. Savol sahnasida "yozuv" bo'sh, \
"aytish" — savolni o'qib beradi.
- IMLO: o'zbek lotin alifbosi to'liq — o', g' va tutuq belgisini HECH QACHON tashlab ketma: to'g'ri, bo'lingan, ko'paytma, yig'indi, bo'ladi, ko'rinish, o'quvchi.
- "aytish" da funksiya nomlari to'liq: sinus, kosinus, tangens, kotangens ("sin", "cos", "tg" emas); "alpha" emas — "alfa".
- Savol "variantlar" i — doska kabi formulalar bilan (x², √2/2, π/6), so'z bilan emas. To'rt variantning qiymatlari har xil bo'lsin (bir-biriga teng ikki variant bo'lmasin).
- Chizma turi mazmunga mos: trigonometrik tenglama va funksiya — "grafik" (masalan y = sin x va y = 1/2, kesishish nuqtalari π/6, 5π/6 deb yorliqlangan); tengsizlik va oraliq — "sonOqi"; uchburchak, aylana — "geometriya".
- Tushuntirish CHUQUR bo'lsin: har qoidaning NEGA to'g'riligi (qisqa isbot yoki chizmadan ko'rinishi), har misolda har qadam sababi bilan.
- Hamma hisob to'g'ri bo'lsin. DTM darajasida, maktab dasturidan chiqma."""

#: Tutuq belgisi tushib qolgan so'zlar — model shunday yozsa dars qayta yasaladi.
IMLO_XATO = re.compile(
    r"\b(togri|notogri|bolingan|boladi|bolsa|bolib|kopaytma|kopaytir\w*|yigindi\w*|korinish\w*|koring|"
    r"koramiz|oquvchi\w*|ozgar\w*|oxsh\w*|songra)\b", re.I)


def _matnlari(d: dict) -> list[str]:
    """O'quvchi ko'radigan/eshitadigan matnlar — JSON kalitlarisiz ("togri" kaliti imlo xatosi emas)."""
    natija = [str(d.get("nom") or ""), str(d.get("maqsad") or "")]
    for s in d.get("sahnalar") or []:
        if not isinstance(s, dict):
            continue
        natija.append(str(s.get("aytish") or ""))
        natija += [str(q) for q in s.get("yozuv") or []]
        sv = s.get("savol")
        if isinstance(sv, dict):
            natija += [str(sv.get("matn") or ""), str(sv.get("izoh") or "")]
            natija += [str(v) for v in sv.get("variantlar") or []]
    return natija


def _imlo_xatolari(d: dict) -> list[str]:
    return sorted({m.group(0) for t in _matnlari(d) for m in IMLO_XATO.finditer(t)})


def tozala_dars(d: dict) -> dict:
    """
    Model ko'p qiladigan mayda kamchiliklarni qoida bilan tuzatadi:
    ovoz matnida qisqartmalar (TTS "tg" ni harfma-harf o'qiydi), doskada
    "pi" o'rniga π.
    """
    nom = {"ctg": "kotangens", "tg": "tangens", "tan": "tangens", "sin": "sinus", "cos": "kosinus",
           "alpha": "alfa", "Alpha": "Alfa"}

    def ovoz(m: str) -> str:
        return re.sub(r"\b(ctg|tg|tan|sin|cos|alpha|Alpha)\b", lambda x: nom[x.group(1)], m)

    def doska(m: str) -> str:
        # "5pi/6" → "5π/6", "2pi k" → "2π k"; oldingi bo'shliqqa tegilmaydi ("+ pi" → "+ π").
        return re.sub(r"(\d*)pi\b", lambda x: f"{x.group(1)}π", m)

    for s in d.get("sahnalar") or []:
        if isinstance(s.get("aytish"), str):
            s["aytish"] = ovoz(s["aytish"])
        if isinstance(s.get("yozuv"), list):
            s["yozuv"] = [doska(str(q)) for q in s["yozuv"]]
        sv = s.get("savol")
        if isinstance(sv, dict):
            sv["variantlar"] = [doska(str(v)) for v in sv.get("variantlar") or []]
            sv["matn"] = doska(str(sv.get("matn") or ""))
        ch = s.get("chizma")
        # Model ba'zan chizmani suhbatdagidek ```chizma ... ``` MATNI qilib yozadi —
        # undan JSON ajratib olinadi (aks holda ilova uni tashlab ketadi).
        if isinstance(ch, str):
            m = re.search(r"\{[\s\S]*\}", ch)
            try:
                ch = json.loads(m.group(0)) if m else None
            except ValueError:
                ch = None
            s["chizma"] = ch
        if isinstance(ch, dict) and isinstance(ch.get("nuqtalar"), list):
            for n in ch["nuqtalar"]:
                if isinstance(n, dict) and isinstance(n.get("nom"), str):
                    n["nom"] = doska(n["nom"])
    return d


TEKSHIR_SOROV = """Quyidagi DTM matematika darsini qattiq imtihonchi sifatida tekshir. \
Har hisob, formula, chizma koordinatasi va savollarning "togri" indeksini o'zing \
qaytadan hisobla. Kichik uslub kamchiliklarini emas, faqat MATEMATIK xatolarni \
va noto'g'ri javob indekslarini yoz. "aytish" va "yozuv" bir-biriga zid bo'lsa — \
bu ham xato. JSON: {{"xatolar":["qaysi sahna, nima xato, to'g'risi nima"]}} — xato \
bo'lmasa bo'sh ro'yxat.

DARS:
{dars}"""


def bolaklar(aytish: str, n: int = 190) -> list[str]:
    """`lib/jonliDars.ts` → `ovozBolaklari` bilan AYNAN bir xil (ovoz kalitlari mos tushsin)."""
    gaplar = [g for g in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", aytish or "").strip()) if g]
    natija: list[str] = []
    for g in gaplar:
        if len(g) <= n:
            natija.append(g)
            continue
        qoldiq = g
        while len(qoldiq) > n:
            kesim = max(qoldiq.rfind(", ", 0, n + 2), qoldiq.rfind(" ", 0, n + 1))
            k = kesim + 1 if kesim > n / 2 else n
            natija.append(qoldiq[:k].strip())
            qoldiq = qoldiq[k:].strip()
        if qoldiq:
            natija.append(qoldiq)
    return natija


#: Dars bir marta yasaladi va minglab odam ko'radi — shuning uchun suhbatdagidan
#: kuchliroq model ishlatilsa arziydi (`--model`).
MODEL = {"nom": ""}


def _json_chaqir(sorov: str, fikr: str = "medium") -> dict:
    from openai import OpenAI

    mijoz = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=240, max_retries=2)
    javob = mijoz.chat.completions.create(
        model=MODEL["nom"] or settings.OPENAI_MODEL,
        messages=[{"role": "system", "content": TIZIM}, {"role": "user", "content": sorov}],
        response_format={"type": "json_object"},
        max_completion_tokens=16000,
        reasoning_effort=fikr,
    )
    return json.loads(javob.choices[0].message.content or "{}")


def _sahnalar_toza(d: dict) -> bool:
    """Tuzilma tekshiruvi — mijozdagi `tekshirDars` dan qattiqroq (yasashda xatoni ushlash)."""
    s = d.get("sahnalar")
    if not isinstance(s, list) or not 6 <= len(s) <= 18:
        return False
    for x in s:
        if not isinstance(x, dict) or not str(x.get("aytish") or "").strip():
            return False
        sv = x.get("savol")
        if sv is not None:
            if not isinstance(sv, dict) or not isinstance(sv.get("variantlar"), list) or len(sv["variantlar"]) < 2:
                return False
            if not isinstance(sv.get("togri"), int) or not 0 <= sv["togri"] < len(sv["variantlar"]):
                return False
        if re.search(r"[=^√/π°²<>+]", str(x.get("aytish") or "")):
            return False
    return True


class Command(BaseCommand):
    help = "DTM mavzusi bo'yicha jonli (ovozli, chizmali) darslar yasaydi"

    def add_arguments(self, p):
        p.add_argument("slug", choices=sorted(ai_reja.MAVZULAR))
        p.add_argument("--soni", type=int, default=4)
        p.add_argument("--chiqish", default="")
        p.add_argument("--ovozsiz", action="store_true", help="faqat JSON, ovoz yasalmaydi")
        p.add_argument("--faqat-ovoz", default="", help="tayyor JSON fayl — faqat ovozini yasash")
        p.add_argument("--model", default="", help="yasash modeli (standart — OPENAI_MODEL)")

    def handle(self, slug, soni, chiqish, ovozsiz, faqat_ovoz, model, **_):
        MODEL["nom"] = model
        if not settings.OPENAI_API_KEY and not faqat_ovoz:
            raise CommandError("OPENAI_API_KEY yo'q")
        chiqish = chiqish or f"/tmp/{slug}.json"
        if faqat_ovoz:
            with open(faqat_ovoz, encoding="utf-8") as f:
                natija = json.load(f)
        else:
            natija = {"slug": slug, "darslar": self._yasa(slug, max(1, min(8, soni)))}
            with open(chiqish, "w", encoding="utf-8") as f:
                json.dump(natija, f, ensure_ascii=False, indent=1)
            self.stdout.write(f"JSON: {chiqish}")
        if not ovozsiz:
            self._ovoz(natija)

    def _yasa(self, slug: str, soni: int) -> list[dict]:
        from core.ai import CHIZMA

        nom = ai_reja.MAVZULAR[slug]
        reja = _json_chaqir(REJA_SOROV.format(nom=nom, soni=soni), fikr="low").get("darslar") or []
        if not reja:
            raise CommandError("reja bo'sh keldi")
        reja_matn = "\n".join(f"{r.get('n')}. {r.get('nom')} — {r.get('maqsad')}" for r in reja)
        self.stdout.write(f"Reja:\n{reja_matn}")
        darslar = []
        for r in reja[:soni]:
            sorov = DARS_SOROV.format(nom=nom, reja=reja_matn, n=r.get("n"), dars_nom=r.get("nom"),
                                      maqsad=r.get("maqsad"), chizma=CHIZMA)
            dars, izoh = None, ""
            for urinish in range(4):
                d = tozala_dars(_json_chaqir(sorov + izoh))
                imlo = _imlo_xatolari(d)
                if imlo:
                    izoh = ("\n\nOLDINGI JAVOBDA IMLO XATOSI (tutuq belgisi tushib qolgan): "
                            + ", ".join(imlo) + ". O'zbek lotin imlosida yoz.")
                    self.stdout.write(f"  {r.get('n')}-dars: imlo xatosi {imlo[:5]}, qayta ({urinish + 1})")
                    continue
                if not _sahnalar_toza(d):
                    izoh = "\n\nOLDINGI JAVOB QOIDAGA MOS EMAS EDI (sahnalar soni, savol tuzilmasi yoki " \
                           "\"aytish\" da belgi). Qoidalarga qat'iy amal qil."
                    self.stdout.write(f"  {r.get('n')}-dars: tuzilma xato, qayta ({urinish + 1})")
                    continue
                xatolar = _json_chaqir(TEKSHIR_SOROV.format(dars=json.dumps(d, ensure_ascii=False))).get("xatolar") or []
                if not xatolar:
                    dars = d
                    break
                self.stdout.write(f"  {r.get('n')}-dars: tekshiruv {len(xatolar)} xato topdi, qayta")
                for x in xatolar[:6]:
                    self.stdout.write(f"     - {str(x)[:160]}")
                dars = d
                izoh = "\n\nOLDINGI VARIANTDA TEKSHIRUVCHI TOPGAN XATOLAR — tuzat:\n" + \
                       "\n".join(f"- {x}" for x in xatolar[:10])
            if dars is None:
                raise CommandError(f"{r.get('n')}-dars yasalmadi")
            dars["n"] = int(r.get("n") or len(darslar) + 1)
            darslar.append(dars)
            self.stdout.write(self.style.SUCCESS(f"  {dars['n']}-dars tayyor: {len(dars['sahnalar'])} sahna"))
        return darslar

    def _ovoz(self, natija: dict) -> None:
        from core import ovoz as O

        import time

        jami = yangi = belgi = 0
        chiqmadi: list[str] = []
        for d in natija.get("darslar") or []:
            for s in d.get("sahnalar") or []:
                for b in bolaklar(s.get("aytish") or ""):
                    jami += 1
                    if O.bormi(b):
                        continue
                    # Aisha ba'zan 500 qaytaradi ("tts_generation_failed") —
                    # bitta bo'lak butun darsni to'xtatmasin: 3 urinish, keyin
                    # o'tkazib yuboriladi (pleyer uni subtitr bilan o'qish
                    # vaqticha kutib o'tadi) va oxirida ro'yxatda chiqadi.
                    for urinish in range(3):
                        try:
                            O.yasa(b, budjet=False)
                            yangi += 1
                            belgi += len(O.tozala(b))
                            break
                        except O.OvozXato as e:
                            if urinish == 2:
                                chiqmadi.append(f"{b[:70]} — {str(e)[:80]}")
                            else:
                                time.sleep(3 * (urinish + 1))
        self.stdout.write(self.style.SUCCESS(f"Ovoz: {jami} bo'lak, {yangi} ta yangi ({belgi} belgi)"))
        if chiqmadi:
            self.stdout.write(self.style.WARNING(f"Chiqmadi ({len(chiqmadi)}):"))
            for x in chiqmadi:
                self.stdout.write(f"  - {x}")
