"""Fixtures shared by every test module (pytest loads them by name, no import needed)."""

from app.test.main_test import session

__all__ = ["session"]
