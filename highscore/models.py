from django.db import models
import core

class Highscore(models.Model):
    id = models.BigIntegerField(primary_key=True)
    username = models.CharField(max_length=150)
    score = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'highscore_highscore'
