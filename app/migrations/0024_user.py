# Generated by Django 5.0.2 on 2024-11-25 11:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0023_alter_achievement_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alignment', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='app.alignment')),
            ],
        ),
    ]
