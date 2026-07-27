"""
Ism va familiyani tozalash.

Telegram profilidagi ism bizning qoidamizga bo'ysunmaydi. Odamlar u yerga
bezak qo'yadi — `꧁❖DAVRONOV❖꧂`, `𝓓𝓪𝓿𝓻𝓸𝓷𝓸𝓿`, `Ali 🔥` — va bu ism ilovaga
tayyor holda kelib tushadi. Uni shunchaki RAD ETSAK, odam o'zining Telegram
ismi bilan ro'yxatdan o'ta olmay qoladi: forma "faqat harflardan iborat
bo'lsin" deydi-yu, maydonda o'sha ism turaveradi va nima noto'g'riligi
ko'rinmaydi.

Shuning uchun tekshirishdan oldin TOZALAYMIZ:

  * `NFKC` — bezakli shriftlarni oddiy harfga qaytaradi. `𝓓` → `D`.
    Ular alohida harf emas, o'sha harfning boshqacha chizilgani, shuning
    uchun bu ma'noni buzmaydi.
  * harf bo'lmagan hamma narsa tashlanadi — emoji, ramka, raqam, tinish.
    Qoladigan istisno: bo'shliq, chiziqcha va apostrof, ular ism ichida
    haqiqatan uchraydi (`Abdulla-Aziz`, `Sa'dulla`).
  * ketma-ket ajratgichlar bittaga tushadi, chetdagilari kesiladi.

Natijada `꧁❖DAVRONOV❖꧂` → `DAVRONOV`, ya'ni odam hech narsa qilmasdan
o'tib ketadi. Bir harf ham qolmasa — o'shanda so'raymiz.
"""
import re
import unicodedata

#: Ism ichida uchraydigan, harf bo'lmagan belgilar.
#:
#: Apostrof beshta ko'rinishda yoziladi — `o'`, `o‘`, `o’`, `oʻ`, `oʼ`.
#: Hammasi klaviaturaga va avtomatik almashtirishga qarab chiqadi;
#: bittasini tashlab yuborsak, `Gʻulom` → `Gulom` bo'lib ketardi.
AJRATGICH = " '‘’ʻʼ-"

_KETMA_KET = re.compile(f"[{re.escape(AJRATGICH)}]{{2,}}")

#: Ustundagi chegara (`Pupil.first_name`), undan uzunini kesib tashlaymiz.
UZUNLIK = 120


def tozala(v: str) -> str:
    """Ismni saqlashga yaroqli holga keltiradi. Hech qachon xato bermaydi."""
    belgilar = []
    for ch in unicodedata.normalize("NFKC", v or ""):
        kat = unicodedata.category(ch)
        if kat[0] in "LM":          # harf yoki unga qo'shiladigan belgi
            belgilar.append(ch)
        elif ch.isspace():
            belgilar.append(" ")
        elif ch in AJRATGICH:
            belgilar.append(ch)
        # qolgani — bezak, emoji, raqam, tinish — tushib qoladi

    natija = _KETMA_KET.sub(lambda m: m.group(0)[0], "".join(belgilar))
    return natija.strip(AJRATGICH)[:UZUNLIK].strip(AJRATGICH)


def harfli(v: str) -> bool:
    """Ichida kamida ikkita harf bormi — "A." yoki "-" o'tmasligi uchun."""
    return sum(unicodedata.category(ch)[0] == "L" for ch in v) >= 2
