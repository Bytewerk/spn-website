import random
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User


def create_viewer_key():
    return None


class SnakeVersion(models.Model):
    class Meta:
        get_latest_by = "created"
        unique_together = ('user', 'version')

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey("SnakeVersion", blank=True, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(default=now, blank=True)
    code = models.TextField()
    comment = models.CharField(max_length=1000, blank=True, null=True)
    version = models.IntegerField()
    server_error_message = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.version:
            self.version = self.get_max_version_number() + 1
        super(SnakeVersion, self).save(*args, **kwargs)

    def get_max_version_number(self):
        return SnakeVersion.objects.filter(user=self.user).aggregate(models.Max('version'))['version__max'] or 0

    def activate(self):
        UserProfile.objects.update_or_create(user=self.user, defaults={'active_snake': self})

    @staticmethod
    def get_latest_for_user(user):
        return SnakeVersion.objects.filter(user=user).latest('created')

    objects = models.Manager()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    viewer_key = models.BigIntegerField(unique=True)
    active_snake = models.ForeignKey(SnakeVersion, null=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        if not self.viewer_key:
            self.viewer_key = random.getrandbits(63)
        super(UserProfile, self).save(*args, **kwargs)

class LiveStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    last_update_frame = models.IntegerField(blank=True, null=True)

    mass = models.FloatField(blank=True, null=True)
    natural_food_consumed = models.FloatField(blank=True, null=True)
    carrison_food_consumed = models.FloatField(blank=True, null=True)
    hunted_food_consumed = models.FloatField(blank=True, null=True)

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
