from django.shortcuts import render
from django.db.models import Max
from core.models import SnakeGame

def table(request):
    data = SnakeGame.objects.values('user__username').annotate(score=Max('final_mass')).order_by('-final_mass')
    return render(request, 'highscore/table.html', context={'highscores': data})
