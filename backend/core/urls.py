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

    # Do'st bilan bellashuv. Tartib muhim: `duel/royxat` `duel/<kod>` dan
    # OLDIN turishi kerak, aks holda "royxat" kod deb qabul qilinardi.
    path("duel", views.duel_boshla, name="duel-boshla"),
    path("duel/royxat", views.duel_royxat, name="duel-royxat"),
    path("duel/<str:kod>", views.duel_korish, name="duel-korish"),
    path("duel/<str:kod>/qabul", views.duel_qabul, name="duel-qabul"),
    path("duel/<str:kod>/tayyor", views.duel_tayyor, name="duel-tayyor"),
    path("duel/<str:kod>/holat", views.duel_holat, name="duel-holat"),
    path("duel/<str:kod>/ball", views.duel_ball, name="duel-ball"),
    path("duel/<str:kod>/natija", views.duel_natija, name="duel-natija"),
    path("duel/<str:kod>/yana", views.duel_yana, name="duel-yana"),
]
