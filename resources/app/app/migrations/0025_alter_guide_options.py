# Generated by Django 5.0.2 on 2024-11-27 11:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0024_user'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='guide',
            options={'ordering': ['page'], 'verbose_name': 'Guide', 'verbose_name_plural': 'Guides'},
        ),
    ]