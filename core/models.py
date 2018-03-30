from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User


class Team(models.Model):
    leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)


class TeamMembership(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request_date = models.DateTimeField(default=now, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)


class Snake(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)


class SnakeVersion(models.Model):
    class Meta:
        get_latest_by = "created"
    snake = models.ForeignKey(Snake, on_delete=models.CASCADE)
    created = models.DateTimeField(default=now, blank=True)
    code = models.TextField()



class SnakeGame(models.Model):
    snake_version = models.ForeignKey(SnakeVersion, on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_team = models.ForeignKey(Team, blank=True, null=True, on_delete=models.SET_NULL)

