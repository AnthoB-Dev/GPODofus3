from django.urls import path
from . import views

app_name = "app"  # Namespace de l'application

urlpatterns = [
    path("guide/", views.guide_detail, name="guide"),
    path("guide/<int:guide_id>/", views.guide_detail, name="guide_detail"),
    path(
        "guide/<int:guide_id>/achievements/",
        views.guide_achievements_partial,
        name="guide_achievements_partial",
    ),
    path(
        "guide/<int:guide_id>/objectives/",
        views.guide_objectives_partial,
        name="guide_objectives_partial",
    ),
    path(
        "guide/<int:guide_id>/quests/",
        views.guide_quests_partial,
        name="guide_quests_partial",
    ),
    path(
        "guide/<int:guide_id>/quests/<int:achievement_id>/",
        views.guide_quests_partial,
        name="guide_quests_achievement",
    ),
    path('toggle-quest/<int:quest_id>/', views.toggle_quest_completion, name='toggle_quest_completion'),
]
