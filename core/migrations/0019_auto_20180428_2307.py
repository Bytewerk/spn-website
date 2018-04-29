# Generated by Django 2.0.4 on 2018-04-28 21:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_auto_20180425_1724'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='team',
            name='leader',
        ),
        migrations.RemoveField(
            model_name='teammembership',
            name='team',
        ),
        migrations.RemoveField(
            model_name='teammembership',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='current_team',
        ),
        migrations.DeleteModel(
            name='Team',
        ),
        migrations.DeleteModel(
            name='TeamMembership',
        ),
    ]