# Generated by Django 5.0.9 on 2024-12-10 16:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0027_quest_position'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='quest',
            options={'ordering': ['position'], 'verbose_name': 'Quête', 'verbose_name_plural': 'Quêtes'},
        ),
        migrations.AlterField(
            model_name='quest',
            name='position',
            field=models.PositiveIntegerField(default='', help_text='Position de la quête par rapport aux autres du succès', null=True),
        ),
    ]
