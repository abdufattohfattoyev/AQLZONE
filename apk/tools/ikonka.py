"""
Eski Android uchun ikonka PNG larini yasaydi.

─────────────────────── NEGA KERAK ───────────────────────

Android 8 va undan yuqorisi ikonkani XML dan oladi
(`mipmap-anydpi-v26/ic_launcher.xml`) va u yerda hamma narsa vektor.
Android 7 esa vektorni ikonka sifatida qabul qilmaydi — unga PNG kerak,
har ekran zichligi uchun alohida.

Chizishning boshqa yo'li yo'q edi: telefonda ham, bu kompyuterda ham
SVG ni rasmga aylantiradigan vosita yo'q. Shuning uchun belgi shu yerda
QO'LDA chiziladi — yo'llar `frontend/public/logo.svg` dan olingan.

─────────────────────── QANDAY ISHLATILADI ───────────────────────

    python tools/ikonka.py

Fayllar `app/src/main/res/mipmap-*/` ichiga yoziladi. Ularni qayta
yasash faqat LOGO o'zgarganda kerak — natija repozitoriyda saqlanadi.
"""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw

# Belgi 120×120 maydonda chizilgan (SVG dagidek).
ASOS = 120

#: Ikonka o'lchamlari — Android talab qiladigan zichliklar.
OLCHAMLAR = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

#: Ichki chizmani necha barobar kattaroq chizamiz.
#:
#: Anti-aliasing shu yerdan keladi: katta chizib, keyin kichraytirsak
#: qirralar silliq bo'ladi. To'g'ridan-to'g'ri 48px ga chizsak, uchburchak
#: chetlari "arra tishi" bo'lib qolardi.
ANIQLIK = 8

FON = (242, 248, 255, 255)
TUND = (22, 41, 94, 255)
SHAPKA = (26, 52, 128, 255)
KITOB = (27, 69, 168, 255)
OQ = (255, 255, 255, 255)


def bezier(p0, p1, p2, p3, n=24):
    """Kubik egri chiziqni nuqtalarga ajratadi."""
    nuqtalar = []
    for i in range(n + 1):
        t = i / n
        m = 1 - t
        x = (m ** 3 * p0[0] + 3 * m * m * t * p1[0]
             + 3 * m * t * t * p2[0] + t ** 3 * p3[0])
        y = (m ** 3 * p0[1] + 3 * m * m * t * p1[1]
             + 3 * m * t * t * p2[1] + t ** 3 * p3[1])
        nuqtalar.append((x, y))
    return nuqtalar


def burish(nuqtalar, burchak, markaz):
    """Nuqtalarni markaz atrofida buradi (SVG dagi `rotate`)."""
    rad = math.radians(burchak)
    kx, ky = markaz
    chiqdi = []
    for x, y in nuqtalar:
        dx, dy = x - kx, y - ky
        chiqdi.append((
            kx + dx * math.cos(rad) - dy * math.sin(rad),
            ky + dx * math.sin(rad) + dy * math.cos(rad),
        ))
    return chiqdi


#: "A" ning rangi — `drawable/logo.xml` dagi gradient bilan AYNAN bir xil.
#:
#: Ikki nusxa bo'lishi yoqimsiz, lekin iloji yo'q: eski Android PNG ni,
#: yangisi XML ni oladi. Bir xil qiymat yozilgani esa muhim — aks holda
#: bir telefonda ko'k, boshqasida yashil ikonka chiqardi.
A_RANG = [
    (0.00, (47, 127, 228)),
    (0.55, (47, 142, 230)),
    (1.00, (34, 189, 109)),
]


def gradient(kanvas, k, ichki, surish):
    """
    "A" ning gradienti — (11,30) dan (109,100) gacha bo'lgan o'q bo'ylab.

    Har piksel shu o'qqa TUSHIRILADI (proyeksiya) va tushgan joyiga
    qarab rang tanlanadi. Oddiy `x/kenglik` bilan hisoblansa, gradient
    tik yo'nalishni umuman hisobga olmasdi va yashil rang A'ning o'ng
    yelkasi o'rniga butun pastki qismiga yoyilib ketardi.
    """
    def joyi(u, v):
        return ((u * ichki + surish) * k, (v * ichki + surish) * k)

    x0, y0 = joyi(11, 30)
    x1, y1 = joyi(109, 100)
    dx, dy = x1 - x0, y1 - y0
    uzunlik = dx * dx + dy * dy

    rasm = Image.new("RGBA", (kanvas, kanvas))
    piks = rasm.load()
    for y in range(kanvas):
        for x in range(kanvas):
            t = ((x - x0) * dx + (y - y0) * dy) / uzunlik
            t = min(1.0, max(0.0, t))
            # Qaysi ikki to'xtash orasida turibdi.
            for i in range(len(A_RANG) - 1):
                t0, r0 = A_RANG[i]
                t1, r1 = A_RANG[i + 1]
                if t <= t1 or i == len(A_RANG) - 2:
                    n = (t - t0) / (t1 - t0) if t1 > t0 else 0
                    n = min(1.0, max(0.0, n))
                    piks[x, y] = tuple(
                        int(r0[j] + (r1[j] - r0[j]) * n) for j in range(3)
                    ) + (255,)
                    break
    return rasm


def chiz(olcham: int, doira: bool) -> Image.Image:
    """Bitta ikonkani chizadi."""
    k = olcham * ANIQLIK / ASOS          # 120 birlikdan piksellarga
    kanvas = olcham * ANIQLIK
    rasm = Image.new("RGBA", (kanvas, kanvas), (0, 0, 0, 0))
    ch = ImageDraw.Draw(rasm)

    def m(nuqtalar):
        """120 lik koordinatani piksellarga o'tkazadi."""
        return [(x * k, y * k) for x, y in nuqtalar]

    # ---- fon ----
    if doira:
        ch.ellipse([0, 0, kanvas - 1, kanvas - 1], fill=FON)
    else:
        # Burchaklari yumaloq kvadrat — Android o'zi ham shunday kesadi.
        ch.rounded_rectangle([0, 0, kanvas - 1, kanvas - 1],
                             radius=kanvas * 0.22, fill=FON)

    # Belgi fon ichida 78% joy egallaydi.
    ichki = 0.78
    surish = ASOS * (1 - ichki) / 2

    def j(nuqtalar):
        """Belgini fon ichiga siqib, o'rtaga qo'yadi."""
        return [(x * ichki + surish, y * ichki + surish) for x, y in nuqtalar]

    # ---- shapka (−13° burilgan) ----
    shapka = burish([(60, 6), (96, 22), (60, 38), (24, 22)], -13, (60, 24))
    ch.polygon(m(j(shapka)), fill=SHAPKA)

    # Shapka tagidagi qism: pastki chekkasi egri.
    tag = ([(48, 29), (48, 38)]
           + bezier((48, 38), (48, 41.4), (53.4, 44), (60, 44))
           + bezier((60, 44), (66.6, 44), (72, 41.4), (72, 38))
           + [(72, 29), (60, 34.3)])
    ch.polygon(m(j(burish(tag, -13, (60, 24)))), fill=TUND)

    # Popuk: ip va tomchi.
    ip = burish([(93.5, 22.6), (93.5, 38.6)], -13, (60, 24))
    ch.line(m(j(ip)), fill=(16, 31, 82, 255), width=max(1, int(2.6 * k * ichki)))
    tomchi = (bezier((93.5, 37), (96.9, 37), (99.1, 39), (99.1, 41.6))
              + bezier((99.1, 41.6), (99.1, 45), (96.7, 48.6), (93.5, 50.2))
              + bezier((93.5, 50.2), (90.3, 48.6), (87.9, 45), (87.9, 41.6))
              + bezier((87.9, 41.6), (87.9, 39), (90.1, 37), (93.5, 37)))
    ch.polygon(m(j(burish(tomchi, -13, (60, 24)))), fill=TUND)

    # ---- "A" ----
    #
    # Teshiklar (ko'ndalang chiziq ustidagi uchburchak va pastdagi
    # to'rtburchak) ALOHIDA niqob orqali kesiladi: PIL da "evenodd"
    # yo'q, shuning uchun avval to'liq shakl chiziladi, keyin teshiklar
    # niqobdan o'chiriladi.
    niqob = Image.new("L", (kanvas, kanvas), 0)
    nch = ImageDraw.Draw(niqob)
    nch.polygon(m(j([(60, 28), (109, 100), (11, 100)])), fill=255)
    nch.polygon(m(j([(60, 58), (71.5, 75), (48.5, 75)])), fill=0)
    nch.polygon(m(j([(44, 83), (76, 83), (80.5, 91), (39.5, 91)])), fill=0)
    rasm.paste(gradient(kanvas, k, ichki, surish), (0, 0), niqob)

    # ---- ochiq kitob ----
    chap = (bezier((4, 98), (21, 89), (43, 90), (58, 100))
            + [(58, 113)]
            + bezier((58, 113), (43, 103), (21, 102), (4, 109)))
    ong = [(ASOS - x, y) for x, y in chap]
    ch.polygon(m(j(chap)), fill=KITOB)
    ch.polygon(m(j(ong)), fill=KITOB)

    kenglik = max(1, int(2.4 * k * ichki))
    chiziq_chap = bezier((8, 96), (24, 89), (44, 90), (58, 99))
    ch.line(m(j(chiziq_chap)), fill=OQ, width=kenglik, joint="curve")
    ch.line(m(j([(ASOS - x, y) for x, y in chiziq_chap])), fill=OQ,
            width=kenglik, joint="curve")

    return rasm.resize((olcham, olcham), Image.LANCZOS)


def main() -> None:
    res = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "res")
    for papka, olcham in OLCHAMLAR.items():
        yol = os.path.abspath(os.path.join(res, papka))
        os.makedirs(yol, exist_ok=True)
        chiz(olcham, doira=False).save(os.path.join(yol, "ic_launcher.png"))
        chiz(olcham, doira=True).save(os.path.join(yol, "ic_launcher_round.png"))
        print(f"{papka}: {olcham}x{olcham}")

    # Play Store uchun 512×512 (do'kon sahifasida shu ko'rinadi).
    dokon = os.path.abspath(os.path.join(res, "..", "..", "..", "..", "tools"))
    chiz(512, doira=False).save(os.path.join(dokon, "dokon-512.png"))
    print("dokon-512.png")


if __name__ == "__main__":
    main()
