"""
Kunlik reklama roligining NAVBATI — papkalar va yonidagi ma'lumot.

Ikki joydan ishlatiladi:

    rolik_post      navbatdagini kanalga va Instagram'ga joylaydi
    core/osish.py   joylanganlar qanday ketganini hisobotga qo'shadi

Yo'l shu yerda, bitta joyda turadi: ikkalasi bir xil papkaga qarashi
shart va bir kun kelib bittasi o'zgarib qolmasligi kerak.

    <ROLIK_PAPKA>/navbat/05_kichkintoy.mp4   + .json  — kutayotganlar
    <ROLIK_PAPKA>/chiqdi/2026-10-06_05_kichkintoy.mp4 + .json  — joylanganlar
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from django.conf import settings


def papkalar() -> tuple[Path, Path]:
    kok = Path(settings.ROLIK_PAPKA)
    return kok / "navbat", kok / "chiqdi"


def navbat() -> list[Path]:
    n, _ = papkalar()
    return sorted(n.glob("*.mp4")) if n.exists() else []


def malumot(video: Path) -> dict:
    """Yonidagi `.json` — post matni, tugma va joylangan post raqamlari."""
    j = video.with_suffix(".json")
    try:
        return json.loads(j.read_text(encoding="utf-8")) if j.exists() else {}
    except (OSError, ValueError):
        return {}


def chiqqanlar(a: date, b: date) -> list[tuple[date, str, dict]]:
    """
    `[a, b)` oralig'ida joylangan roliklar: `(sana, nom, malumot)`.

    Nom — sanasiz qismi (`05_kichkintoy`): hisobotda shu ko'rinadi.
    """
    _, chiqdi = papkalar()
    natija = []
    for j in sorted(chiqdi.glob("*.json")) if chiqdi.exists() else []:
        kun, _, nom = j.stem.partition("_")
        try:
            sana = date.fromisoformat(kun)
        except ValueError:
            continue
        if a <= sana < b:
            natija.append((sana, nom, malumot(j.with_suffix(".mp4"))))
    return natija
