import os
import django
import json

# Configurer Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.models import GuideAchievement, AchievementQuest

# Récupération des données filtrées sur la visibilité du guide
data = []

# Charger uniquement les guides avec is_visible=True
for guide_achievement in GuideAchievement.objects.select_related('guide', 'achievement').filter(guide__is_visible=True):
  # Récupérer les quêtes liées via AchievementQuest
  quests = AchievementQuest.objects.filter(achievement=guide_achievement.achievement).select_related('quest')

  # Formatage des quêtes avec le champ `completed`
  quest_data = [
    {
      "id": quest.quest.id,
      "completed": quest.quest.completed  # Inclure le statut de complétion
    }
    for quest in quests
  ]

  # Ajouter les données du guide et des quêtes dans une structure
  data.append({
    "guide": {
      "id": guide_achievement.guide.id,
    },
    "achievement": {
      "id": guide_achievement.achievement.id,
    },
    "quests": quest_data,
    "is_last_seen": guide_achievement.is_last_seen,
  })

# Chemin vers le dossier AppData\Roaming\GPODofus3
appdata_folder = os.path.join(os.environ.get('APPDATA'), 'GPODofus3')

# Vérifiez si le dossier existe, sinon créez-le
if not os.path.exists(appdata_folder):
  os.makedirs(appdata_folder)

# Définir le chemin complet du fichier JSON
output_file = os.path.join(appdata_folder, 'save.json')
old_save_file = os.path.join(appdata_folder, 'old_save.json')

# Si le fichier save.json existe déjà, le renommer en old_save.json
if os.path.exists(output_file):
  os.rename(output_file, old_save_file)

# Écriture des nouvelles données dans le fichier save.json
with open(output_file, 'w', encoding='utf-8') as f:
  json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Données exportées avec succès dans {output_file}. L'ancien fichier a été renommé en {old_save_file}.")
