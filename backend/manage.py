#!/usr/bin/env python
"""Aql Zone — Django boshqaruv skripti."""
import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aqlzone.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:  # pragma: no cover
        raise ImportError(
            "Django topilmadi. Avval bog'liqliklarni o'rnating:\n"
            "    pip install -r requirements.txt"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
