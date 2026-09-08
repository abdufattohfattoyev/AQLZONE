"""
Admin masalalarining chizmalarini qaytadan chizadi.

    python manage.py masala_rasm --sinov --papka /tmp/chizma   # faylga
    python manage.py masala_rasm                               # bazaga
    python manage.py masala_rasm piramida tarozi               # tanlab

─────────────────── NEGA KOD, GRAFIK MUHARRIR EMAS ───────────────────

Chizmalar bir marta chizilib qo'yiladigan narsa emas. Ularda savol
matni ham bor, ya'ni masala tahrirlansa chizma ham eskiradi; brend
o'zgarsa hammasi birdan o'zgarishi kerak; xato topilsa (bir marta
piramidaning yig'indisi to'g'ri kelmagan edi) uni TUZATIB, qaytadan
chizish kerak bo'ladi. Muharrirda chizilgan o'n beshta fayl bilan bu
ishlarning hech biri qilib bo'lmaydi — kod bilan hammasi bitta buyruq.

Shuning uchun chizmalar shu yerda, omborda turadi va masalaga MATNI
BO'YICHA ulanadi (`kalit`), raqami bo'yicha emas: raqam har bazada
boshqacha, matn esa masalaning o'zi.

─────────────────── TAMG'A BU YERDA BOSILMAYDI ───────────────────

AqlZone belgisi `core/rasm.py` da, ya'ni saqlash yo'lida bosiladi
(`core/tamga.py` dagi izohga qarang). Bu yerda uni ikkinchi marta
bosish kerak emas va MUMKIN emas — ikkita tamg'a chiqib qolardi.

─────────────────── SUPERSAMPLING ───────────────────

Hamma narsa uch barobar katta chiziladi va oxirida kichraytiriladi.
Pillow chiziqlarni tekislamaydi: to'g'ridan-to'g'ri chizilgan qiya
chiziq va aylana zinapoyali bo'lib chiqadi va chizma "qo'lbola"
ko'rinadi. Kichraytirish esa o'sha zinalarni o'zi silliqlaydi.
"""
from __future__ import annotations

import math
import os

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from core.models import Masala
from core.rasm import tayyorla
from core.tamga import _shrift

try:
    from PIL import Image, ImageDraw
except ImportError:                                   # pragma: no cover
    Image = None                                      # type: ignore[assignment]

S = 3
W, H = 900, 700
FON = (251, 252, 255)
INK = (26, 36, 80)
XIRA = (120, 133, 170)
BINAFSHA = (143, 87, 207)
KOK = (55, 146, 201)
YASHIL = (51, 168, 98)
QIZIL = (226, 90, 76)
SARIQ = (232, 168, 30)
OQ = (255, 255, 255)

MARKAZ = W / 2


# ────────────────────────────────────────────── chizish yordamchilari

def yangi():
    im = Image.new("RGB", (W * S, H * S), FON)
    return im, ImageDraw.Draw(im)


def matn(d, xy, s, px=26, rang=INK, qalin=False, markaz=False):
    f = _shrift(px * S)
    x, y = xy[0] * S, xy[1] * S
    d.text((x, y), s, font=f, fill=rang, anchor="mm" if markaz else None)


def savol(d, qatorlar):
    """
    Chizma ostidagi savol — har doim bir joyda.

    Savol chizmaning ichida takrorlanadi, garchi u masala matnida ham
    bo'lsa: rasm kanaldan skrinshot bo'lib chiqib ketadi va o'sha
    yerda matnsiz qoladi. Savolsiz chizma esa shunchaki bezak.
    """
    y = 500 if len(qatorlar) < 3 else 470
    for i, (s, rang) in enumerate(qatorlar):
        matn(d, (MARKAZ, y + i * 46), s, 28 if rang is XIRA else 30,
             rang, True, True)


def chiziq(d, p, rang=INK, en=3):
    d.line([(x * S, y * S) for x, y in p], fill=rang, width=en * S, joint="curve")


def tortburchak(d, x1, y1, x2, y2, ich=None, chet=INK, en=4, r=0):
    q = [x1 * S, y1 * S, x2 * S, y2 * S]
    if r:
        d.rounded_rectangle(q, r * S, fill=ich, outline=chet, width=en * S)
    else:
        d.rectangle(q, fill=ich, outline=chet, width=en * S)


def doira(d, cx, cy, r, ich=None, chet=INK, en=4):
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
              fill=ich, outline=chet, width=en * S)


def kopburchak(d, nuqtalar, ich=None, chet=None, en=3):
    d.polygon([(x * S, y * S) for x, y in nuqtalar], fill=ich,
              outline=chet, width=en * S)


def yoy(d, p1, p2, balandlik, rang, en=4):
    """
    Ikki nuqta orasidagi sakrash yoyi.

    `ImageDraw.arc` o'rniga qo'lda kvadratik egri: `arc` faqat o'qlarga
    parallel ellipsning bo'lagini chizadi, ya'ni boshi va oxiri turli
    BALANDLIKDA bo'lgan sakrashni (zinapoyadagidek) u umuman chiza
    olmaydi.
    """
    (x1, y1), (x2, y2) = p1, p2
    ox, oy = (x1 + x2) / 2, (y1 + y2) / 2 - balandlik
    nuqtalar = []
    for i in range(25):
        t = i / 24
        nuqtalar.append((
            (1 - t) ** 2 * x1 + 2 * (1 - t) * t * ox + t * t * x2,
            (1 - t) ** 2 * y1 + 2 * (1 - t) * t * oy + t * t * y2,
        ))
    chiziq(d, nuqtalar, rang, en)


def strelka(d, cx, cy, burchak, uzun, en, rang):
    a = math.radians(burchak - 90)
    chiziq(d, [(cx, cy), (cx + uzun * math.cos(a), cy + uzun * math.sin(a))],
           rang, en)


def siferblat(d, cx, cy, r):
    doira(d, cx, cy, r, OQ, INK, 5)
    for k in range(12):
        a = math.radians(k * 30 - 90)
        ich = r - (22 if k % 3 == 0 else 14)
        chiziq(d, [(cx + ich * math.cos(a), cy + ich * math.sin(a)),
                   (cx + (r - 6) * math.cos(a), cy + (r - 6) * math.sin(a))],
               INK, 4 if k % 3 == 0 else 2)


# ──────────────────────────────────────────────────────── chizmalar

def soat_burchak(d):
    """3:20 — ikki strelka orasidagi burchak."""
    cx, cy, r = MARKAZ, 248, 155
    siferblat(d, cx, cy, r)
    # Soat strelkasi 3 da TURMAYDI: 20 daqiqada u yana 10 gradus
    # yuradi. Masalaning butun mazmuni shunda, shuning uchun sektor
    # aynan shu ikki chiziq orasiga bo'yaladi.
    soat_b, daqiqa_b = 3 * 30 + 20 * 0.5, 120
    sr = 118
    d.pieslice([(cx - sr) * S, (cy - sr) * S, (cx + sr) * S, (cy + sr) * S],
               start=soat_b - 90, end=daqiqa_b - 90, fill=(226, 214, 248))
    strelka(d, cx, cy, soat_b, 92, 8, INK)
    strelka(d, cx, cy, daqiqa_b, 132, 5, KOK)
    doira(d, cx, cy, 9, INK, INK, 1)
    # Savol belgisi sektorning O'RTASIDA va undan tashqarida: ikki
    # strelka orasidagi burchak juda tor va belgi ular ustiga tushsa
    # o'qilmay qolardi.
    orta = math.radians((soat_b + daqiqa_b) / 2 - 90)
    matn(d, (cx + (r + 34) * math.cos(orta), cy + (r + 34) * math.sin(orta)),
         "?", 36, BINAFSHA, True, True)
    matn(d, (cx, cy + r + 46), "3:20", 32, INK, True, True)
    savol(d, [("Soat strelkasi 3 da turmaydi — u ham yurgan", XIRA),
              ("Ikki strelka orasidagi kichik burchak necha gradus?", BINAFSHA)])


def kvadrat_doira(d):
    """Kvadrat → doira → kvadrat: yuzlar nisbati."""
    cx, cy, yarim = MARKAZ, 280, 165
    tortburchak(d, cx - yarim, cy - yarim, cx + yarim, cy + yarim,
                (238, 244, 255), KOK, 5)
    doira(d, cx, cy, yarim, None, YASHIL, 5)
    # Ichki kvadrat — doiraga ichki chizilgan, ya'ni 45 gradus qiya.
    kopburchak(d, [(cx, cy - yarim), (cx + yarim, cy), (cx, cy + yarim),
                   (cx - yarim, cy)], (238, 232, 252), BINAFSHA, 5)
    matn(d, (cx, cy), "?", 40, BINAFSHA, True, True)
    matn(d, (cx - yarim - 46, cy), "a", 30, KOK, True, True)
    savol(d, [("Katta kvadrat → doira → yana kvadrat", XIRA),
              ("Katta kvadratning yuzi kichigidan necha marta katta?", BINAFSHA)])


def gugurt(d):
    """Kvadratlar zanjiri: birinchisi 4 cho'p, keyingilari 3 tadan."""
    k, y0 = 118, 175
    x0 = MARKAZ - 1.75 * k
    for i in range(3):
        x = x0 + i * k
        tortburchak(d, x, y0, x + k, y0 + k, OQ, INK, 5)
        # Qo'shni bilan UMUMIY tomon boshqa rangda: masalaning butun
        # sirri shu tomonning ikki marta sanalmasligida.
        if i:
            chiziq(d, [(x, y0), (x, y0 + k)], QIZIL, 6)
        matn(d, (x + k / 2, y0 + k / 2), str(i + 1), 30, XIRA, True, True)
    matn(d, (x0 + 3 * k + 42, y0 + k / 2), "…", 44, XIRA, True, True)
    matn(d, (MARKAZ, y0 + k + 62), "4  +  3  +  3  +  …", 34, INK, True, True)
    matn(d, (MARKAZ, y0 + k + 108), "qizil tomon — tayyor, qayta sanalmaydi",
         24, QIZIL, False, True)
    savol(d, [("100 ta kvadratdan iborat zanjirda", XIRA),
              ("nechta gugurt cho'pi bor?", BINAFSHA)])


def shaxmat(d):
    """Qarama-qarshi burchagi kesilgan taxta va domino."""
    k = 44
    x0, y0 = MARKAZ - 4 * k, 92
    for r in range(8):
        for c in range(8):
            qora = (r + c) % 2
            kesilgan = (r, c) in ((0, 0), (7, 7))
            tortburchak(d, x0 + c * k, y0 + r * k, x0 + (c + 1) * k,
                        y0 + (r + 1) * k,
                        (235, 238, 248) if kesilgan
                        else ((120, 140, 190) if qora else (240, 244, 252)),
                        INK, 1)
    for r, c in ((0, 0), (7, 7)):
        x, y = x0 + c * k, y0 + r * k
        chiziq(d, [(x + 9, y + 9), (x + k - 9, y + k - 9)], QIZIL, 4)
        chiziq(d, [(x + k - 9, y + 9), (x + 9, y + k - 9)], QIZIL, 4)
    # Ikkita namuna domino — o'quvchi qoidani ko'rsin.
    tortburchak(d, x0 + 2 * k + 5, y0 + 3 * k + 5, x0 + 4 * k - 5,
                y0 + 4 * k - 5, None, SARIQ, 5, 8)
    tortburchak(d, x0 + 5 * k + 5, y0 + 1 * k + 5, x0 + 6 * k - 5,
                y0 + 3 * k - 5, None, SARIQ, 5, 8)
    savol(d, [("Ikkita burchak kesildi — 62 ta katak qoldi", XIRA),
              ("Eng ko'pi bilan nechta 1x2 domino joylashadi?", BINAFSHA)])


def poyezd(d):
    """Ikki poyezd va orasida uchayotgan pashsha."""
    y = 268
    chiziq(d, [(120, y + 62), (780, y + 62)], XIRA, 4)
    for x, yon in ((150, 1), (750, -1)):
        tortburchak(d, x - 55, y, x + 55, y + 56, (200, 218, 248), KOK, 4, 10)
        for i in range(3):
            tortburchak(d, x - 40 + i * 28, y + 10, x - 20 + i * 28, y + 30,
                        OQ, KOK, 2, 3)
        doira(d, x - 28, y + 60, 10, INK, INK, 1)
        doira(d, x + 28, y + 60, 10, INK, INK, 1)
        strelka(d, x + yon * 72, y + 28, 90 if yon > 0 else 270, 26, 5, YASHIL)
        matn(d, (x, y + 92), "50 km/soat", 24, KOK, False, True)

    # Pashsha POYEZDLAR USTIDAN uchadi va har safar qisqaroq masofani
    # bosadi. Yo'l vagonlar orasidan o'tkazilsa, chiziq ularni kesib
    # o'tardi; yoylar esa "u yoqqa — bu yoqqa" harakatini bir qarashda
    # ko'rsatadi. Aynan shu qaytishlarni qo'shishga urinish masalaning
    # tuzog'i, shuning uchun ular chizmada ko'rinishi kerak.
    baza = y - 26
    chap, ong = 212, 688
    for i in range(4):
        yoy(d, (chap, baza) if i % 2 == 0 else (ong, baza),
            (ong, baza) if i % 2 == 0 else (chap, baza),
            76 - i * 14, SARIQ, 3)
        chap, ong = chap + 52, ong - 52
    doira(d, 212, baza, 9, SARIQ, SARIQ, 1)
    matn(d, (MARKAZ, y - 122), "75 km/soat", 24, SARIQ, False, True)

    chiziq(d, [(150, y + 128), (750, y + 128)], INK, 2)
    matn(d, (MARKAZ, y + 158), "100 km", 30, INK, True, True)
    savol(d, [("Poyezdlar to'qnashguncha", XIRA),
              ("pashsha jami necha km uchadi?", BINAFSHA)])


def piramida(d):
    """Sonlar piramidasi: har katak ostidagi ikkitasining yig'indisi."""
    k, bosh_y = 78, 110
    pastki = ["3", "7", "?", "9"]
    for qi, n in enumerate((1, 2, 3, 4)):
        y = bosh_y + qi * (k + 8)
        x0 = MARKAZ - (n * (k + 8)) / 2
        for i in range(n):
            x = x0 + i * (k + 8)
            oxirgi = qi == 3
            tortburchak(d, x, y, x + k, y + k,
                        (238, 232, 252) if qi == 0 else OQ,
                        BINAFSHA if qi == 0 else INK, 4, 10)
            yozuv = "48" if qi == 0 else (pastki[i] if oxirgi else "?")
            matn(d, (x + k / 2, y + k / 2), yozuv, 30,
                 BINAFSHA if qi == 0 else (INK if oxirgi else XIRA), True, True)
    savol(d, [("Har katak — ostidagi ikkitasining yig'indisi", XIRA),
              ("Savol belgisi o'rnida qaysi son turadi?", BINAFSHA)])


def tarozi(d):
    """Muvozanatdagi tarozi: kub va sharlar."""
    chiziq(d, [(MARKAZ, 130), (MARKAZ, 210)], INK, 5)
    chiziq(d, [(MARKAZ - 270, 210), (MARKAZ + 270, 210)], INK, 6)
    kopburchak(d, [(MARKAZ, 130), (MARKAZ - 40, 70), (MARKAZ + 40, 70)], XIRA)
    for x in (MARKAZ - 270, MARKAZ + 270):
        chiziq(d, [(x, 210), (x, 268)], XIRA, 3)
        chiziq(d, [(x - 115, 268), (x + 115, 268)], INK, 5)

    def kub(x):
        tortburchak(d, x - 20, 218, x + 20, 258, (200, 225, 255), KOK, 3, 6)

    def shar(x):
        doira(d, x, 238, 20, (255, 224, 190), SARIQ, 3)

    for i in range(4):
        (kub if i < 3 else shar)(MARKAZ - 270 - 69 + i * 46)
    for i in range(5):
        (kub if i < 2 else shar)(MARKAZ + 270 - 88 + i * 44)

    matn(d, (MARKAZ, 340), "3 kub + 1 shar   =   2 kub + 3 shar", 30, INK, True, True)
    savol(d, [("Tarozi muvozanatda", XIRA),
              ("Bitta kub necha sharga teng?", BINAFSHA)])


def burchak_soat(d):
    """9:00 → 9:30: soat strelkasi necha gradus buriladi."""
    for cx, vaqt, soat_b, daqiqa_b in (
        (MARKAZ - 220, "9:00", 270, 0), (MARKAZ + 220, "9:30", 285, 180),
    ):
        cy, r = 250, 150
        siferblat(d, cx, cy, r)
        strelka(d, cx, cy, soat_b, 80, 8, INK)
        strelka(d, cx, cy, daqiqa_b, 125, 5, KOK)
        doira(d, cx, cy, 8, INK, INK, 1)
        matn(d, (cx, cy + r + 45), vaqt, 32, INK, True, True)
    savol(d, [("Yarim soat o'tdi — kalta strelkaga qarang", XIRA),
              ("Soat strelkasi necha gradusga buriladi?", BINAFSHA)])


def setka(d):
    """3x3 setka: jami nechta kvadrat."""
    k = 110
    x0, y0 = MARKAZ - 1.5 * k, 120
    for r in range(3):
        for c in range(3):
            tortburchak(d, x0 + c * k, y0 + r * k,
                        x0 + (c + 1) * k, y0 + (r + 1) * k, OQ, INK, 4)
    # Ikkita namuna: kichigi ham, kattasi ham SANALADI — masalaning
    # butun qiyinligi shuni payqashda.
    tortburchak(d, x0, y0, x0 + k, y0 + k, None, BINAFSHA, 6)
    tortburchak(d, x0 + k, y0 + k, x0 + 3 * k, y0 + 3 * k, None, YASHIL, 6)
    savol(d, [("Kichkinalari ham, kattalari ham sanaladi", XIRA),
              ("Bu chizmada jami nechta kvadrat bor?", BINAFSHA)])


def yosh(d):
    """Ota va o'g'il: bugun va besh yildan keyin."""
    for x0, sarlavha, ota, ogil, nisbat in (
        (MARKAZ - 250, "Bugun", 200, 50, "ota = 4 × o'g'il"),
        (MARKAZ + 110, "5 yildan keyin", 220, 70, "ota = 3 × o'g'il"),
    ):
        matn(d, (x0 + 70, 120), sarlavha, 28, XIRA, False, True)
        tortburchak(d, x0, 150, x0 + 140, 150 + ota, (200, 218, 248), KOK, 4, 12)
        matn(d, (x0 + 70, 150 + ota / 2), "Ota", 28, KOK, True, True)
        tortburchak(d, x0, 160 + ota, x0 + 140, 160 + ota + ogil,
                    (222, 245, 230), YASHIL, 4, 12)
        matn(d, (x0 + 70, 160 + ota + ogil / 2), "O'g'il", 24, YASHIL, True, True)
        # Nisbat ustunlar OSTIDA, orasida emas: o'rtadagi ustun ikki
        # chizmani bir-biriga yopishtirib, ikkalasini ham o'qilmas
        # qilib qo'yardi. Balandligi ikkalasida bir xil — ustunlar
        # turlicha tugaydi va yozuvlar zinapoya bo'lib qolmasin.
        matn(d, (x0 + 70, 462), nisbat, 24, BINAFSHA, True, True)
    matn(d, (MARKAZ, 280), "+5", 30, XIRA, True, True)
    savol(d, [("Ota bugun necha yoshda?", BINAFSHA)])


def uchburchak_yuz(d):
    """To'rtburchak ichidagi uchburchakning yuzi."""
    x1, y1, x2, y2 = MARKAZ - 250, 120, MARKAZ + 250, 420
    tortburchak(d, x1, y1, x2, y2, OQ, INK, 5)
    kopburchak(d, [(x1, y2), (x2, y2), (x1 + 340, y1)],
               (238, 232, 252), BINAFSHA, 4)
    # Uchinchi uch YUQORI TOMON bo'ylab suriladi — balandlik
    # o'zgarmaydi, demak yuz ham. Uzuq chiziq shuni aytadi.
    for x in range(int(x1) + 20, int(x2) - 10, 34):
        chiziq(d, [(x, y1 - 16), (x + 18, y1 - 16)], XIRA, 3)
    matn(d, (MARKAZ, y1 - 44), "uch shu chiziq bo'ylab siljiydi", 22, XIRA, False, True)
    chiziq(d, [(x1 + 340, y1), (x1 + 340, y2)], BINAFSHA, 2)
    matn(d, (MARKAZ, y2 + 38), "12 sm", 28, INK, True, True)
    matn(d, (x1 - 52, (y1 + y2) / 2), "8 sm", 28, INK, True, True)
    savol(d, [("To'rtburchakning yuzi 96 sm²", XIRA),
              ("Binafsha uchburchakning yuzi qancha?", BINAFSHA)])


def zina(d):
    """Besh zina: 1 yoki 2 qadam bilan necha xil yo'l."""
    k, x0, y0 = 70, MARKAZ - 120, 430
    for i in range(5):
        tortburchak(d, x0 + i * k, y0 - (i + 1) * 55, x0 + (i + 1) * k, y0,
                    (222, 235, 255), INK, 3)
    matn(d, (x0 - 34, y0 - 20), "0", 26, INK, True, True)
    matn(d, (x0 + 5 * k + 32, y0 - 5 * 55 + 20), "5", 26, YASHIL, True, True)
    # Sakrash yoylari ZINA USTIDAN o'tadi: boshi va oxiri zinalarning
    # yuzasida turadi, ya'ni ular chizmaga qo'shimcha emas, uning
    # davomi bo'lib o'qiladi.
    def usti(i):
        return (x0 + i * k + k / 2, y0 - i * 55)

    for boshi, uzun, rang, izoh in ((0, 1, KOK, "1 qadam"), (1, 2, BINAFSHA, "2 qadam")):
        yoy(d, usti(boshi), usti(boshi + uzun), 52, rang, 5)
        matn(d, (140, 176 + boshi * 40), izoh, 24, rang, True, False)
    savol(d, [("Bir qadamda 1 yoki 2 zinaga chiqiladi", XIRA),
              ("Eng yuqoriga necha xil yo'l bilan chiqiladi?", BINAFSHA)])


def idish(d):
    """5 va 3 litrli idish — o'lchov belgisisiz."""
    for cx, balandlik, hajm, rang in (
        (MARKAZ - 170, 260, "5 l", KOK), (MARKAZ + 170, 200, "3 l", YASHIL),
    ):
        x1, x2, y2 = cx - 90, cx + 90, 420
        y1 = y2 - balandlik
        tortburchak(d, x1, y1, x2, y2, OQ, INK, 5, 12)
        matn(d, (cx, y1 - 40), hajm, 34, rang, True, True)
        for i in range(1, 4):
            y = y2 - balandlik * i / 4
            chiziq(d, [(x1 + 8, y), (x1 + 30, y)], XIRA, 2)
    matn(d, (MARKAZ, 462), "o'lchov belgilari yo'q, suv cheksiz", 24, XIRA, False, True)
    savol(d, [("Eng kam nechta amal bilan", XIRA),
              ("5 litrli idishda aniq 4 litr qoladi?", BINAFSHA)])


def sharlar(d):
    """Qutidagi 4 qizil, 3 ko'k, 2 yashil shar."""
    tortburchak(d, MARKAZ - 200, 120, MARKAZ + 200, 400, (245, 247, 255), INK, 5, 24)
    ranglar = [QIZIL] * 4 + [KOK] * 3 + [YASHIL] * 2
    joylar = [(-130, 200), (-50, 190), (30, 205), (110, 195),
              (-100, 280), (-10, 285), (80, 275),
              (-60, 350), (50, 345)]
    for (dx, y), rang in zip(joylar, ranglar):
        doira(d, MARKAZ + dx, y, 34, rang, INK, 3)
    matn(d, (MARKAZ, 448), "atigi uchta rang bor", 24, XIRA, False, True)
    savol(d, [("Kamida nechta shar olinsa,", XIRA),
              ("ikkita bir xil rang albatta chiqadi?", BINAFSHA)])


def kub_kesik(d):
    """Bir burchagi kesilgan kub: nechta yoq qoldi."""
    cx, cy, a = MARKAZ, 290, 150
    tepa = [(cx, cy - a), (cx + a, cy - a / 2), (cx, cy), (cx - a, cy - a / 2)]
    chap = [(cx - a, cy - a / 2), (cx, cy), (cx, cy + a), (cx - a, cy + a / 2)]
    ong = [(cx + a, cy - a / 2), (cx, cy), (cx, cy + a), (cx + a, cy + a / 2)]
    for yuz, rang in ((tepa, (222, 235, 255)), (chap, (200, 218, 248)),
                      (ong, (176, 200, 240))):
        kopburchak(d, yuz, rang, INK, 2)
    # Kesik uchburchak — YANGI yoq. Eski uchtasi kichrayadi, lekin
    # yo'qolmaydi: javobdagi butun hiyla shunda.
    kes = [(cx, cy - a), (cx + a / 2, cy - a * 0.75), (cx, cy - a / 2),
           (cx - a / 2, cy - a * 0.75)]
    kopburchak(d, kes, (255, 224, 190), QIZIL, 4)
    matn(d, (cx + a + 40, cy - a * 0.8), "yangi yoq", 24, QIZIL, False, True)
    savol(d, [("Bitta burchak tekis kesib olindi", XIRA),
              ("Hosil bo'lgan jismda nechta yoq bor?", BINAFSHA)])


#: Chizma → masala. Kalit — masala matnining boshi: raqam har bazada
#: boshqacha bo'lishi mumkin, matn esa masalaning o'zi.
CHIZMALAR: dict[str, tuple] = {
    "soat_burchak": (soat_burchak, "Soat 3:20 ni ko'rsatyapti"),
    "kvadrat_doira": (kvadrat_doira, "Katta kvadratga doira ichki chizilgan"),
    "gugurt": (gugurt, "Gugurt cho'plaridan kvadratlar zanjiri"),
    "shaxmat": (shaxmat, "8x8 shaxmat taxtasidan ikkita"),
    "poyezd": (poyezd, "Ikki poyezd bir-biridan 100 km"),
    "piramida": (piramida, "Sonlar piramidasi"),
    "tarozi": (tarozi, "Tarozi muvozanatda turibdi"),
    "burchak_soat": (burchak_soat, "Soat 9:00 dan 9:30 gacha"),
    "setka": (setka, "3 x 3 katakli setka"),
    "yosh": (yosh, "Bugun ota o'g'lidan 4 marta katta"),
    "uchburchak_yuz": (uchburchak_yuz, "To'rtburchakning tomonlari 12 sm"),
    "zina": (zina, "Zinapoyada 5 ta zina bor"),
    "idish": (idish, "Sizda 5 litrli va 3 litrli idish"),
    "sharlar": (sharlar, "Qutida 4 ta qizil"),
    "kub_kesik": (kub_kesik, "Yog'och kubning bitta burchagi"),
}


def chiz(nom: str) -> bytes:
    """Bitta chizmani PNG baytlariga chizadi."""
    im, d = yangi()
    CHIZMALAR[nom][0](d)
    kichik = im.resize((W, H), Image.LANCZOS)
    from io import BytesIO
    xotira = BytesIO()
    kichik.save(xotira, "PNG", optimize=True)
    return xotira.getvalue()


class Command(BaseCommand):
    help = "Admin masalalarining chizmalarini qaytadan chizadi"

    def add_arguments(self, parser) -> None:
        parser.add_argument("nomlar", nargs="*",
                            help="chizma nomlari (bo'sh — hammasi)")
        parser.add_argument("--sinov", action="store_true",
                            help="bazaga tegmaydi, faylga yozadi")
        parser.add_argument("--papka", default="/tmp/masala-chizma",
                            help="--sinov uchun chiqish papkasi")

    def handle(self, *args, **o) -> None:
        if Image is None:                             # pragma: no cover
            self.stderr.write("Pillow o'rnatilmagan")
            return

        nomlar = o["nomlar"] or list(CHIZMALAR)
        notogri = [n for n in nomlar if n not in CHIZMALAR]
        if notogri:
            self.stderr.write(f"noma'lum chizma: {', '.join(notogri)}")
            return

        if o["sinov"]:
            os.makedirs(o["papka"], exist_ok=True)

        yangilandi = topilmadi = 0
        for nom in nomlar:
            baytlar = chiz(nom)

            if o["sinov"]:
                yol = os.path.join(o["papka"], f"{nom}.png")
                with open(yol, "wb") as f:
                    f.write(baytlar)
                self.stdout.write(f"  {nom:16} → {yol} ({len(baytlar) // 1024} KB)")
                continue

            kalit = CHIZMALAR[nom][1]
            masala = Masala.objects.filter(matn__startswith=kalit).first()
            if masala is None:
                self.stderr.write(f"  {nom:16} → masala topilmadi ({kalit!r})")
                topilmadi += 1
                continue

            # Eskisi qo'lda o'chiriladi: Django ImageField almashganda
            # eski faylni O'ZI o'chirmaydi va disk asta-sekin
            # ishlatilmaydigan rasmlar bilan to'lardi.
            eski = masala.rasm.name if masala.rasm else ""
            masala.rasm = tayyorla(ContentFile(baytlar, name=f"{nom}.png"))
            masala.save(update_fields=["rasm"])
            if eski and eski != masala.rasm.name:
                try:
                    masala.rasm.storage.delete(eski)
                except Exception:                     # noqa: BLE001
                    pass

            self.stdout.write(f"  {nom:16} → #{masala.pk} {masala.rasm.name}")
            yangilandi += 1

        if not o["sinov"]:
            xulosa = f"yangilandi: {yangilandi}"
            if topilmadi:
                xulosa += f" | topilmadi: {topilmadi}"
            self.stdout.write(self.style.SUCCESS(xulosa))
