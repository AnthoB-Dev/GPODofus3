from decimal import Decimal
from django.db import models


GAME_VERSION = Decimal("2.73")
DEFAULT_ALIGNMENT_ID = 3


class Achievement(models.Model):
    """
    Représente un succès/achievement déblocable dans le jeu.

    Les succès ont un role central dans cette application, le guide de Skyzio faisant beaucoups référence à ces derniers.
    Attributes:
        title: Le titre du succès
        url: Lien vers la page DPLN du succès
        completion_points: Nombre de points de succès attribués à la complétion
        objectives: Les objectifs à réaliser pour compléter le succès (commentaires de la partie "Schéma global" du guide de Skyzio)
        expect_*: Les différents types de demandes attendu lors de la complétion du succès
    """

    title = models.CharField(max_length=255, verbose_name="titre")
    url = models.URLField(max_length=255)
    completion_points = models.IntegerField(verbose_name="Point de succès")
    objectives = models.TextField(
        max_length=255, null=True, blank=True, verbose_name="Objectifs"
    )
    expect_ressource = models.BooleanField(
        default=False, verbose_name="Demande : Ressource"
    )
    expect_item = models.BooleanField(default=False, verbose_name="Demande : Item")
    expect_fight = models.BooleanField(default=False, verbose_name="Demande : Combat")
    expect_dungeon = models.BooleanField(default=False, verbose_name="Demande : Donjon")
    expect_job = models.BooleanField(default=False, verbose_name="Demande : Métier")
    expect_other = models.BooleanField(default=False, verbose_name="Demande : Autre")
    expect_alignment = models.BooleanField(
        default=False, verbose_name="Demande : Alignement"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    created_in_version = models.FloatField(
        default=GAME_VERSION, verbose_name="Créer en version"
    )
    updated_for_version = models.FloatField(
        default=GAME_VERSION,
        blank=True,
        null=True,
        verbose_name="Mis à jour lors de la version",
    )
    quests = models.ManyToManyField(
        "Quest", through="AchievementQuest", related_name="achievements"
    )

    class Meta:
        ordering = ["title"]
        verbose_name = "Succès"
        verbose_name_plural = "Succès"

    def __str__(self):
        return f"{self.title}"


class AchievementQuest(models.Model):
    """
    Table intermédiaire qui lie les succès (Achievement) aux quêtes (Quest).

    Cette relation permet de :
    - Associer les quêtes nécessaires à la réalisation d'un succès
    - Suivre l'ordre dans lequel les quêtes doivent être réalisées

    Attributes:
        achievement: Le succès concerné
        quest: La quête associée
    """

    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        verbose_name="Succès",
        help_text="Le succès auquel cette quête est liée",
    )

    quest = models.ForeignKey(
        "Quest",
        on_delete=models.CASCADE,
        verbose_name="Quêtes",
        help_text="La quête à réaliser pour ce succès",
    )

    class Meta:
        unique_together = ("achievement", "quest")
        db_table = "achievement_quest"

    def __str__(self):
        return f"{self.achievement.title} - {self.quest.title}"


class Alignment(models.Model):
    """
    Représente l'alignement d'une quête dans le jeu.

    Ce modèle permet de catégoriser les quêtes selon leur type/alignement ce qui a pour effet de n'afficher que les quêtes Bontarien ou Brâkmarien. La troisième option étant neutre pour les autres.
    """

    name = models.CharField(
        max_length=100, verbose_name="Nom", help_text="Nom de l'alignement"
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["id"]
        verbose_name = "Alignement"
        verbose_name_plural = "Alignements"


class CommonSpell(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nom")
    obtainment = models.CharField(max_length=255, verbose_name="Obtention")
    url = models.URLField(null=True, blank=True)
    guide = models.ForeignKey(
        "Guide", on_delete=models.CASCADE, related_name="common_spells", null=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        verbose_name = "Sort commun"
        verbose_name_plural = "Sorts communs"


class Guide(models.Model):
    title = models.CharField(max_length=255, verbose_name="Titre")
    objectives = models.TextField("Objectifs", max_length=500)
    important_info = models.TextField("A prévoir", null=True, blank=True)
    explanations = models.TextField("Guide", null=True, blank=True)
    page = models.FloatField()
    recommended_level = models.IntegerField(verbose_name="Niveau recommandé")
    alignment = models.ForeignKey(
        Alignment,
        on_delete=models.CASCADE,
        related_name="guides",
        null=True,
        blank=True,
        verbose_name="Alignement",
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    created_in_version = models.FloatField(
        default=GAME_VERSION, verbose_name="Créer en version"
    )
    updated_for_version = models.FloatField(
        default=GAME_VERSION,
        blank=True,
        null=True,
        verbose_name="Mis à jour lors de la version",
    )
    achievement = models.ManyToManyField(
        Achievement, through="GuideAchievement", related_name="guides"
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["id"]  # TODO: Changer l'ordre de tri par "page"
        verbose_name = "Guide"
        verbose_name_plural = "Guides"


class GuideAchievement(models.Model):
    guide = models.ForeignKey(Guide, on_delete=models.CASCADE, verbose_name="Guide")
    achievement = models.ForeignKey(
        Achievement, on_delete=models.CASCADE, verbose_name="Succès"
    )

    class Meta:
        unique_together = ("guide", "achievement")
        db_table = "guide_achievement"
        verbose_name = "Guide - Succès"
        verbose_name_plural = "Guide - Succès"

    def __str__(self):
        return f"{self.guide.title} - {self.achievement.title}"


class Dungeon(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nom")
    level = models.IntegerField(verbose_name="Niveau")
    url = models.URLField(null=True, blank=True)
    guide = models.ForeignKey(
        "Guide", on_delete=models.CASCADE, related_name="dungeons_guide", null=True
    )
    captured = models.BooleanField(
        default=False,
        verbose_name="Capturé ?",
        help_text="Le donjon a-t-il été capturé ?",
    )
    completed = models.BooleanField(
        default=False,
        verbose_name="Complété ?",
        help_text="Le donjon a-t-il été complété ?",
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        verbose_name = "Donjon"
        verbose_name_plural = "Donjons"


class DungeonQuest(models.Model):
    dungeon = models.ForeignKey(
        "Dungeon", on_delete=models.CASCADE, verbose_name="Donjon"
    )
    quest = models.ForeignKey("Quest", on_delete=models.CASCADE, verbose_name="Quête")

    class Meta:
        unique_together = ("dungeon", "quest")
        db_table = "dungeon_quest"
        verbose_name = "Donjon - Quête"
        verbose_name_plural = "Donjon - Quêtes"

    def __str__(self):
        return f"{self.dungeon.name} - {self.quest.title}"


class LastSession(models.Model):
    last_guide = models.ForeignKey("Guide", on_delete=models.SET_NULL, null=True)
    last_achievement = models.ForeignKey('Achievement', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Last guide: {self.last_guide}, Last achievement: {self.last_achievement}"

    class Meta:
        verbose_name = "Dernière session"
        verbose_name_plural = "Dernières sessions"


class Quest(models.Model):
    """
    Représente une quête du jeu.

    Stocke les informations essentielles d'une quête comme son titre,
    son statut de complétion et son alignement.

    Attributes:
        title: Le titre de la quête
        url: Lien vers la page DPLN de la quête
        alignment: L'alignement de la quête
        completed: Indique si la quête a été complétée
        created_in_version: Version du jeu où la quête a été ajoutée
    """

    title = models.CharField(
        max_length=100, verbose_name="Titre", help_text="Le titre unique de la quête"
    )
    url = models.URLField(max_length=255, help_text="URL de la page DPLN de la quête")
    alignment = models.ForeignKey(
        Alignment,
        on_delete=models.CASCADE,
        related_name="quests",
        default=DEFAULT_ALIGNMENT_ID,
        verbose_name="Alignement",
        help_text="L'alignement requis pour cette quête",
    )
    dungeon = models.ManyToManyField(
        "Dungeon", through="DungeonQuest", related_name="quests"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    created_in_version = models.FloatField(
        default=GAME_VERSION, verbose_name="Créer en version"
    )
    updated_for_version = models.FloatField(
        default=GAME_VERSION,
        blank=True,
        null=True,
        verbose_name="Mis à jour lors de la version",
    )
    completed = models.BooleanField(
        default=False,
        verbose_name="Complété ?",
        help_text="La quête a-t-elle été complétée ?",
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["title"]
        verbose_name = "Quête"
        verbose_name_plural = "Quêtes"
