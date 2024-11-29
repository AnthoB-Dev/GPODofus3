from django.core.cache import cache
from django.db.models import Prefetch
from app.models import Achievement, Alignment, Guide, GuideAchievement, Quest, User

ADMIN_FILTER_IDS = [1, 2, 3, 4]
ALIGNED_FILTER_IDS = [3, 4]

def get_guides_and_navigation(guide, is_admin, alignment_ids, admin_ids):
    if not is_admin:
        cache_key = f"all_guides_alignment_{'_'.join(map(str, alignment_ids))}"
        guides = cache.get(cache_key)
        if guides is None:
            guides = Guide.objects.filter(alignment_id__in=alignment_ids).only("id", "title").order_by("page").all()
            cache.set(cache_key, guides, 60 * 60)  # Cache pour 1h
        filter_ids = alignment_ids
    else:
        cache_key = f"all_guides_admin_{'_'.join(map(str, admin_ids))}"
        guides = cache.get(cache_key)
        if guides is None:
            guides = Guide.objects.filter(alignment_id__in=admin_ids).only("id", "title").order_by("page").all()
            cache.set(cache_key, guides, 60 * 60)  # Cache pour 1h
        filter_ids = admin_ids

    previous_guide = None
    if guide.page > 0:
        previous_guide = (
            Guide.objects.filter(page__lt=guide.page, page__gt=0, alignment_id__in=filter_ids)
            .order_by("-page")
            .first()
        )

    next_guide = Guide.objects.filter(page__gt=guide.page, alignment_id__in=filter_ids).order_by("page").first()

    return guides, previous_guide, next_guide

def get_navigation_context(guide, is_admin):
    user = User.objects.first()
    if user.alignment.name == "Neutre":
        alignment_ids = [user.alignment_id]
    else:
        alignment_ids = [user.alignment_id] + ALIGNED_FILTER_IDS
    admin_ids = ADMIN_FILTER_IDS

    guides, previous_guide, next_guide = get_guides_and_navigation(guide, is_admin, alignment_ids, admin_ids)

    return {
        "guides": guides,
        "previous_guide": previous_guide,
        "next_guide": next_guide,
    }

def get_filtered_quests(achievement, is_admin, alignment_ids, admin_ids):
    if not is_admin: # Voir les quêtes si aligné à Bonta ou Brâkmar + les quêtes "aligner" communes
        return achievement.quests.filter(alignment_id__in=alignment_ids) if achievement else Quest.objects.none()
    else: # Tout voir : ADMIN
        return achievement.quests.filter(alignment_id__in=admin_ids) if achievement else Quest.objects.none()

def generate_expect_list(achievement, user_alignment):
    expect_list = []
    for field in achievement._meta.get_fields():
        if field.name.startswith('expect_') and getattr(achievement, field.name):
            expect = field.name[7:]
            if expect == 'alignment' and user_alignment != "Neutre":
                if user_alignment == "Bonta":
                    expect = 'alignment_bonta'
                elif user_alignment == "Brâkmar":
                    expect = 'alignment_brak'
            expect_list.append(expect)
    return expect_list

def get_selected_achievement(guide_achievements, guide):
    selected_guide_achievement = guide_achievements.filter(is_last_seen=True).first()
    if selected_guide_achievement:
        return selected_guide_achievement.achievement
    return guide.achievement.first()

def calculate_completion_percentage(achievement, user_alignment, guide):
    if not guide.alignment_id in ALIGNED_FILTER_IDS:
        quests = achievement.quests.filter(alignment=user_alignment)
    else:
        quests = achievement.quests.all()
    
    total_quests_count = quests.count()
    completed_quests_count = quests.filter(completed=True).count()
    
    return int((completed_quests_count / total_quests_count * 100)) if total_quests_count > 0 else 0

def get_last_seen_achievement_id(guide_achievements, current_achievement):
    for ga in guide_achievements:
        if ga.is_last_seen:
            return ga.achievement.id
    return guide_achievements.first().achievement.id if guide_achievements.exists() else None