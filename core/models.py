import random
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User


def create_viewer_key():
    return random.getrandbits(63)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    viewer_key = models.BigIntegerField(default=create_viewer_key, unique=True)


class SnakeVersion(models.Model):
    class Meta:
        get_latest_by = "created"
        unique_together = ('user', 'version')

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(default=now, blank=True)
    code = models.TextField()
    comment = models.CharField(max_length=1000, blank=True, null=True)
    version = models.IntegerField()
    prev_version = models.IntegerField(blank=True, null=True)

    objects = models.Manager()


class ActiveSnake(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    version = models.ForeignKey(SnakeVersion, on_delete=models.CASCADE)

    objects = models.Manager()


class SnakeGame(models.Model):
    snake_version = models.ForeignKey(SnakeVersion, on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    start_frame = models.IntegerField(blank=True, null=True)
    end_frame = models.IntegerField(blank=True, null=True)
    killer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="games_won")
    final_mass = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.user.username + " " + str(self.start_date)


class ServerCommand(models.Model):
    COMMAND_CHOICES = (('kill', 'kill'),)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dt_created = models.DateTimeField(auto_now_add=True, blank=True)
    dt_processed = models.DateTimeField(null=True, blank=True, editable=False)
    command = models.CharField(max_length=255, choices=COMMAND_CHOICES)
    result = models.NullBooleanField(editable=False)
    result_msg = models.TextField(blank=True, null=True, editable=False)
