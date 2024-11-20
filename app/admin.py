from django.contrib import admin

from .models import (
    Achievement,
    AchievementQuest,
    Alignment,
    CommonSpell,
    Dungeon,
    DungeonQuest,
    Guide,
    GuideAchievement,
    LastSession,
    Quest,
)


class AchievementQuestInline(admin.TabularInline):
    model = AchievementQuest
    extra = 1


class DungeonQuestInline(admin.TabularInline):
    model = DungeonQuest
    extra = 1


class DungeonGuideInline(admin.TabularInline):
    model = Dungeon
    extra = 1


class GuideAchievementInline(admin.TabularInline):
    model = GuideAchievement
    extra = 1


class QuestAchievementInline(admin.TabularInline):
    model = AchievementQuest
    extra = 1


class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "id",
        "completion_points",
        "created_in_version",
        "updated_for_version",
        "updated_at",
    )
    list_filter = ("completion_points", "created_in_version", "updated_at")
    search_fields = ("title",)
    inlines = [AchievementQuestInline]


class AlignmentAdmin(admin.ModelAdmin):
    list_display = ["name", "id"]


class DungeonAdmin(admin.ModelAdmin):
    list_display = ["name", "id"]
    search_fields = ("name",)
    inlines = [DungeonQuestInline]


class GuideAdmin(admin.ModelAdmin):
    inlines = [GuideAchievementInline, DungeonGuideInline]
    list_display = [
        "title",
        "id",
        "recommended_level",
    ]
    search_fields = ("title",)
    

class LastSessionAdmin(admin.ModelAdmin):
    list_display = ["last_guide", "last_achievement"]


class QuestAdmin(admin.ModelAdmin):
    inlines = [QuestAchievementInline, DungeonQuestInline]
    list_display = ["title", "id"]
    search_fields = ("title",)


admin.site.register(Achievement, AchievementAdmin)
admin.site.register(Alignment, AlignmentAdmin)
admin.site.register(Dungeon, DungeonAdmin)
admin.site.register(CommonSpell)
admin.site.register(Guide, GuideAdmin)
admin.site.register(LastSession, LastSessionAdmin)
admin.site.register(Quest, QuestAdmin)
