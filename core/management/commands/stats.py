from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count, Sum
from core.models import SnakeGame, SnakeVersion
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "show stats"

    def handle(self, *args, **options):
        num_games = SnakeGame.objects.all().count()

        print("total number of games: ", num_games)
        print()

        print("ten players with the most versions:")
        ten_most_versions = SnakeVersion.objects.values('user__username').annotate(num_versions=Count('id')).order_by('-num_versions')[:10]
        for v in ten_most_versions:
            print(v['num_versions'], v['user__username'])
        print()

        # most kills
        kills = []
        deaths = []
        for user in User.objects.all():
            kills.append([SnakeGame.objects.filter(killer=user).count(), user.username])
            deaths.append([SnakeGame.objects.filter(user=user).count(), user.username])

        print("ten players with the most kills:")
        for k in sorted(kills, key=lambda v: v[0], reverse=True)[:10]:
            print(k[0], ": ", k[1])
        print()

        print("ten players killed most often:")
        for k in sorted(deaths, key=lambda v: v[0], reverse=True)[:10]:
            print(k[0], ": ", k[1])
        print()

        print("top ten veggies:")
        for v in SnakeGame.objects.values('user__username').annotate(veggie_factor=Sum('natural_food_consumed')/(Sum('carrison_food_consumed')+Sum('hunted_food_consumed'))).order_by('-veggie_factor')[:10]:
            print(v['veggie_factor'], v['user__username'])
        print()
