# Generated by Django 5.1.2 on 2024-11-03 14:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_gameversion_alter_achievement_created_in_version'),
    ]

    operations = [
        migrations.AlterField(
            model_name='achievement',
            name='created_in_version',
            field=models.FloatField(default='2.73', verbose_name='Créer en version'),
        ),
    ]