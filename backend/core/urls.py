"""Aql Zone — /api/v1 marshrutlari."""
from django.urls import path

from . import views

urlpatterns = [
    path("auth/telegram", views.auth_telegram, name="auth-telegram"),
    path("auth/device", views.auth_device, name="auth-device"),
    path("auth/link", views.auth_link, name="auth-link"),
    path("auth/kod", views.auth_kod, name="auth-kod"),
    path("me", views.me, name="me"),
    path("profiles", views.profiles, name="profiles"),
    path("profiles/<int:pk>", views.profile_detail, name="profile-detail"),
    path("progress", views.progress, name="progress"),
    path("results", views.results, name="results"),
    path("summary", views.summary, name="summary"),
    path("leaderboard", views.leaderboard, name="leaderboard"),
    path("liga", views.liga, name="liga"),
    path("kanal", views.kanal, name="kanal"),
]
