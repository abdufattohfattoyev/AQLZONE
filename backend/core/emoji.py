"""
Kanal postlarida oddiy emoji o'rniga animatsiyali (premium) emoji.

Egasining talabi (2026-10-03): kanalga chiqadigan HAR post premium emoji
bilan. Shuning uchun bu har chaqiruvchida qo'lda qilinmaydi — `xabar.py`
kanalga ketayotgan matnni shu yerdan o'tkazadi va post qaysi buyruqdan
chiqmasin, emojilar o'zi almashadi.

Ro'yxat — Telegramning rasmiy `RestrictedEmoji` to'plami
(`premium_emoji.json`, `getStickerSet` dan olingan). Yangilash:

    getStickerSet?name=RestrictedEmoji → {emoji: custom_emoji_id}

`<tg-emoji>` ichida oddiy belgi qoladi — zaxira: bot premium emojini
ishlata olmaydigan joyda Telegram o'shani ko'rsatadi, post baribir chiqadi.
"""
from __future__ import annotations

import json
import re
from functools import cache
from pathlib import Path

#: Variatsiya belgisi (U+FE0F). Bir emoji matnda u bilan ham, usiz ham
#: yoziladi ("⚡" va "⚡️") — ikkalasi ham topilishi kerak.
VS16 = "️"

#: Allaqachon o'ralgan emojiga tegilmaydi — aks holda qayta tahrirlashda
#: (`sarlavhani_yangila`) teg ichiga teg tushardi.
_TAYYOR = re.compile(r"<tg-emoji\b[^>]*>.*?</tg-emoji>|<[^>]+>", re.S)


@cache
def royxat() -> dict[str, str]:
    """{emoji (VS16 siz): custom_emoji_id}."""
    xom = json.loads((Path(__file__).with_name("premium_emoji.json")).read_text(encoding="utf-8"))
    return {k.replace(VS16, ""): v for k, v in xom.items()}


@cache
def _qolip() -> re.Pattern:
    # Uzunlari oldin: "👨‍💻" ichidagi "💻" alohida o'ralib qolmasin.
    kalitlar = sorted(royxat(), key=len, reverse=True)
    qism = ["".join(re.escape(c) + f"{VS16}?" for c in k) for k in kalitlar]
    return re.compile("|".join(qism))


def premium(matn: str) -> str:
    """Ro'yxatdagi har emojini `<tg-emoji>` ga o'raydi; teglar ichiga tegmaydi."""
    if not matn:
        return matn
    r, q = royxat(), _qolip()

    def ora(m: re.Match) -> str:
        belgi = m.group(0)
        return f'<tg-emoji emoji-id="{r[belgi.replace(VS16, "")]}">{belgi}</tg-emoji>'

    chiqish, i = [], 0
    for t in _TAYYOR.finditer(matn):
        chiqish.append(q.sub(ora, matn[i:t.start()]))
        chiqish.append(t.group(0))
        i = t.end()
    chiqish.append(q.sub(ora, matn[i:]))
    return "".join(chiqish)


def kanalmi(chat_id) -> bool:
    """Kanal yoki guruh (`@nom`, `-100...`) — shaxsiy suhbat emas."""
    s = str(chat_id)
    return s.startswith("@") or s.startswith("-100")
