"""
AI QUIZ YASASH — mavzudan yoki rasm/PDF dagi testdan (`models.QuizAiIsh`).

──────────────────────────── IKKI YO'L ────────────────────────────

    mavzu   "9-sinf, kvadrat tenglama, 10 ta" — AI yangi savollar yozadi
    fayl    qog'ozdagi test surati yoki PDF — AI savollarni O'QIB ko'chiradi;
            to'g'ri javob belgilanmagan bo'lsa, o'zi yechadi

Natija muharrirga tushadi, saqlanmaydi: muallif ko'rib, tuzatib, keyin
saqlaydi. Har savol `ai: True` bilan keladi — muharrir uni "tekshirib
chiqing" deb belgilaydi. AI matematikada adashadi va xato javobli savol
yo'q savoldan yomonroq (`models.Masala` dagi sabab).

──────────────────────────── HUQUQ ────────────────────────────

Faqat faol Premium (`ai-yordamchi` qarori: AI — Premium imkoniyati).
Bir odamga kuniga `KUNLIK` ish va butun ilova uchun `ai.py` dagi umumiy
kunlik chegara — ikkalasi ham bitta OpenAI hisobidan to'lanadi.

Javob JSON SXEMA bilan so'raladi (`response_format`): erkin matnni
ajratib olish har xil formatda sinardi, sxema esa tuzilmani kafolatlaydi.
Mazmun baribir `quiz.savol_tozala` dan o'tadi — yaroqsiz savol tashlanadi.
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from . import ai as AI
from .models import AiXabar, Pupil, QuizAiIsh
from .quiz import MAX_SAVOL, QuizXato, savol_tozala

log = logging.getLogger(__name__)

#: Bir odamga kuniga nechta AI quiz ishi.
KUNLIK = 10
MAX_MATN = 1000
#: PDF hajmi. Rasm — `ai.RASM_MAX` va `ai.rasm_yukla` (kichraytiriladi).
PDF_MAX = 10 * 1024 * 1024
#: 30–40 savollik JSON uzun bo'ladi — suhbat javobidan ko'proq token.
MAX_TOKEN = 16000
#: Shuncha vaqt `kutilmoqda` turgan ish — ishchi yiqilgan, xato deb ko'rsatiladi.
OSILIB_QOLGAN = 300


def _bugun(pupil: Pupil | None = None):
    qs = QuizAiIsh.objects.filter(created_at__gte=AI._bugun_boshi()).exclude(holat=QuizAiIsh.XATO)
    return qs.filter(pupil=pupil) if pupil is not None else qs


def holat(pupil: Pupil) -> dict:
    from . import premium as PR

    premium = PR.faolmi(pupil)
    return {"yoqilgan": AI.yoqilganmi(), "premium": premium,
            "qolgan": max(0, KUNLIK - _bugun(pupil).count()) if premium else 0, "kunlik": KUNLIK}


def _tekshir(pupil: Pupil) -> None:
    from . import premium as PR

    if not PR.faolmi(pupil):
        raise QuizXato("premium", 403)
    if not AI.yoqilganmi():
        raise QuizXato("ai_yopiq", 503)
    if _bugun(pupil).count() >= KUNLIK:
        raise QuizXato("ai_chegara", 429)
    # Umumiy chegara — AI ustoz javoblari bilan birga.
    jami = AI._sanaladigan(AiXabar.objects.filter(created_at__gte=AI._bugun_boshi())).count() + _bugun().count()
    if jami >= settings.AI_KUNLIK_JAMI:
        raise QuizXato("ai_yopiq", 503)


def _pdf_saqla(fayl) -> str:
    if fayl.size > PDF_MAX:
        raise QuizXato("katta")
    boshi = fayl.read(5)
    if boshi != b"%PDF-":
        raise QuizXato("fayl")
    papka = AI._rasm_papka()
    papka.mkdir(parents=True, exist_ok=True)
    nom = f"{uuid.uuid4().hex}.pdf"
    with open(papka / nom, "wb") as f:
        f.write(boshi)
        for bolak in fayl.chunks():
            f.write(bolak)
    return nom


def boshla(pupil: Pupil, matn: str, soni, til: str, fayl=None) -> QuizAiIsh:
    """Yangi ish. Fayl bo'lsa — uni o'qiydi, bo'lmasa — mavzudan yasaydi."""
    matn = (matn or "").strip()[:MAX_MATN]
    try:
        soni = min(max(int(soni or 10), 1), MAX_SAVOL)
    except (TypeError, ValueError):
        soni = 10
    if fayl is None and len(matn) < 3:
        raise QuizXato("bosh")
    fayl_nom, fayl_tur = "", ""
    if fayl is not None:
        nom = (getattr(fayl, "name", "") or "").lower()
        if nom.endswith(".pdf") or getattr(fayl, "content_type", "") == "application/pdf":
            fayl_nom, fayl_tur = _pdf_saqla(fayl), "pdf"
        else:
            try:
                fayl_nom = AI.rasm_yukla(fayl)
            except AI.AiXato as e:
                raise QuizXato(e.kod) from None
            fayl_tur = "rasm"
    with transaction.atomic():
        Pupil.objects.select_for_update().filter(pk=pupil.pk).first()
        _tekshir(pupil)
        ish = QuizAiIsh.objects.create(pupil=pupil, tur="fayl" if fayl_nom else "mavzu", matn=matn,
                                       soni=soni, til="ru" if til == "ru" else "uz",
                                       fayl=fayl_nom, fayl_tur=fayl_tur)
    from .vazifalar import fonda, quiz_ai

    fonda(quiz_ai, ish.pk)
    return ish


def ish_json(ish: QuizAiIsh) -> dict:
    h = ish.holat
    if h == QuizAiIsh.KUTILMOQDA and (timezone.now() - ish.created_at).total_seconds() > OSILIB_QOLGAN:
        h, xato = QuizAiIsh.XATO, "vaqt"
    else:
        xato = ish.xato
    return {"id": ish.pk, "holat": h, "savollar": ish.savollar if h == QuizAiIsh.TAYYOR else [], "xato": xato}


# ------------------------------------------------------------------ model


SXEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "quiz",
        "strict": True,
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "required": ["savollar"],
            "properties": {"savollar": {"type": "array", "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["tur", "matn", "variantlar", "javob", "juftlar"],
                "properties": {
                    "tur": {"type": "string", "enum": ["variant", "yozma", "rost", "tartib", "juftlash"]},
                    "matn": {"type": "string"},
                    "variantlar": {"type": "array", "items": {"type": "string"}},
                    "javob": {"type": "string"},
                    "juftlar": {"type": "array", "items": {
                        "type": "object", "additionalProperties": False, "required": ["chap", "ong"],
                        "properties": {"chap": {"type": "string"}, "ong": {"type": "string"}}}},
                },
            }}},
        },
    },
}

_TIL = {"uz": "o'zbek tilida (lotin yozuvi)", "ru": "rus tilida"}


def tizim(ish: QuizAiIsh) -> str:
    asos = (
        "Siz tajribali matematika o'qituvchisisiz va maktab o'quvchilari uchun quiz tayyorlaysiz. "
        f"Hamma matnni {_TIL[ish.til]} yozing. Formulalarni oddiy matn bilan yozing "
        "(x², √, ≤, π, 3/4 kabi belgilar), LaTeX ishlatmang. Har savolni o'zingiz yechib tekshiring: "
        "to'g'ri javob aniq bo'lishi shart.\n\n"
        "Savol turlari va maydonlar:\n"
        "- variant: 'variantlar' da 4 ta (2–6) har xil javob, 'javob' — ulardan biri AYNAN shu yozuvda;\n"
        "- yozma: 'javob' — qisqa son yoki ifoda, 'variantlar' bo'sh;\n"
        "- rost: tasdiq; 'javob' — to'g'ri bo'lsa \"1\", noto'g'ri bo'lsa \"0\";\n"
        "- tartib: 'variantlar' da 3–6 element TO'G'RI tartibda, 'matn' qanday tartiblashni aytadi;\n"
        "- juftlash: 'juftlar' da 2–5 juft (chap — savol, ong — javob), barcha qiymatlar har xil.\n"
        "Ishlatilmagan maydonlar bo'sh qoladi ('' yoki []). 'matn' 500 belgidan, variant 100 belgidan oshmasin."
    )
    if ish.tur == "fayl":
        return asos + (
            "\n\nVazifa: ilova qilingan rasm yoki PDF dagi test savollarini O'QIB, ularni AYNAN ko'chiring "
            "(tarjima qilmang, faqat formula yozuvini yuqoridagi qoidaga keltiring). To'g'ri javob "
            "belgilangan bo'lsa — shuni oling, bo'lmasa o'zingiz yeching. Chizmasiz tushunib bo'lmaydigan "
            "savolni tashlab keting.")
    return asos + (
        "\n\nVazifa: foydalanuvchi aytgan mavzu va sinf bo'yicha YANGI savollar tuzing. Asosan 'variant', "
        "orasida bir nechta boshqa tur bo'lsin. Oson savoldan qiyiniga qarab tartiblang.")


def _xabar(ish: QuizAiIsh) -> list[dict]:
    if ish.tur == "mavzu":
        return [{"role": "user", "content": f"{ish.matn}\n\nSavollar soni: {ish.soni}."}]
    matn = (ish.matn + "\n\n" if ish.matn else "") + f"Ko'pi bilan {ish.soni} ta savol."
    yol = AI._rasm_papka() / ish.fayl
    b64 = base64.standard_b64encode(yol.read_bytes()).decode("ascii")
    if ish.fayl_tur == "pdf":
        qism = {"type": "file", "file": {"filename": "test.pdf", "file_data": f"data:application/pdf;base64,{b64}"}}
    else:
        qism = {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
    return [{"role": "user", "content": [{"type": "text", "text": matn}, qism]}]


def _chaqir(ish: QuizAiIsh) -> tuple[str, int, int]:
    """OpenAI so'rovi — sinovda shu funksiya almashtiriladi (`ai._chaqir` dagi sabab)."""
    from openai import OpenAI

    mijoz = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=120, max_retries=1)
    qoshimcha = {"reasoning_effort": settings.OPENAI_FIKR} if settings.OPENAI_FIKR else {}
    javob = mijoz.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "system", "content": tizim(ish)}, *_xabar(ish)],
        max_completion_tokens=MAX_TOKEN,
        response_format=SXEMA,
        prompt_cache_key=f"aqlzone-quiz-{ish.tur}",
        safety_identifier=hashlib.sha256(f"aqlzone:{ish.pupil_id}".encode()).hexdigest()[:32],
        **qoshimcha,
    )
    tanlov = javob.choices[0]
    matn = (tanlov.message.content or "").strip()
    if not matn:
        raise RuntimeError(f"bo'sh javob (finish_reason={tanlov.finish_reason})")
    return matn, (javob.usage.prompt_tokens if javob.usage else 0), (javob.usage.completion_tokens if javob.usage else 0)


def savollarga(matn: str, soni: int) -> list[dict]:
    """Model JSON i → tozalangan savollar. Yaroqsiz savol jimgina tashlanadi."""
    try:
        xom = json.loads(matn).get("savollar", [])
    except (ValueError, AttributeError):
        return []
    r = []
    for s in xom if isinstance(xom, list) else []:
        if not isinstance(s, dict):
            continue
        s = {**s, "juftlar": [[j.get("chap"), j.get("ong")] for j in s.get("juftlar") or [] if isinstance(j, dict)],
             "ai": True}
        try:
            r.append(savol_tozala(s))
        except QuizXato:
            continue
        if len(r) >= soni:
            break
    return r


def bajar(ish_id: int) -> str:
    """Fon vazifasi. Xato bilan tugagan ish kunlik chegaraga sanalmaydi."""
    ish = QuizAiIsh.objects.filter(pk=ish_id, holat=QuizAiIsh.KUTILMOQDA).first()
    if ish is None:
        return "yoq"
    try:
        matn, kirish, chiqish = _chaqir(ish)
    except Exception as e:                                       # noqa: BLE001
        if AI._kredit_tugadimi(e):
            AI._kredit_tugadi()
        log.warning("AI quiz %s: %s", ish.pk, e)
        ish.holat, ish.xato = QuizAiIsh.XATO, "ai"
        ish.save(update_fields=["holat", "xato"])
        return "xato"
    savollar = savollarga(matn, ish.soni)
    ish.kirish_token, ish.chiqish_token = kirish, chiqish
    if not savollar:
        ish.holat, ish.xato = QuizAiIsh.XATO, "bosh_natija"
    else:
        ish.holat, ish.savollar = QuizAiIsh.TAYYOR, savollar
    ish.save(update_fields=["holat", "xato", "savollar", "kirish_token", "chiqish_token"])
    # Fayl endi kerak emas — bolaning daftar surati serverda yotib qolmasin.
    if ish.fayl:
        try:
            (AI._rasm_papka() / ish.fayl).unlink(missing_ok=True)
        except OSError:
            pass
    return ish.holat
