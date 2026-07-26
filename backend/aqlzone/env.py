"""
Oddiy .env o'quvchi.

Tashqi paket (python-dotenv) qo'shmaslik uchun kichik funksiya yozilgan:
`.env` faylni bir marta o'qiydi, allaqachon berilgan muhit o'zgaruvchisini
BOSIB O'TMAYDI — ya'ni serverdagi haqiqiy sozlama har doim ustun turadi.
"""
import os
from pathlib import Path

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def _load() -> None:
    if not _ENV_FILE.exists():
        return
    for raw in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load()


def env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def env_bool(key: str, default: bool = False) -> bool:
    raw = os.environ.get(key)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on", "ha"}


def env_list(key: str, default: list[str] | None = None) -> list[str]:
    raw = os.environ.get(key)
    if not raw:
        return list(default or [])
    return [p.strip() for p in raw.split(",") if p.strip()]
