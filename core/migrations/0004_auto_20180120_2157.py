# Generated by Django 2.0.1 on 2018-01-20 20:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20180120_2130'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='snakeversion',
            name='deleted',
        ),
        migrations.RemoveField(
            model_name='snakeversion',
            name='name',
        ),
    ]
