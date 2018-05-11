from django.shortcuts import render
from django.db.models import Max
from core.models import SnakeGame

def table(request):
    if request.user.is_authenticated:
        usr = SnakeGame.objects.filter(user=request.user).aggregate(score=Max('final_mass'))

    data = SnakeGame.objects.values('user__username').annotate(score=Max('final_mass')).order_by('-score')
    for i in range(len(data)):
        data[i]['position'] = '{}.'.format(i+1)
        if request.user.is_authenticated and data[i]['user__username'] == request.user.username:
            usr['position'] = data[i]['position']

    context={'highscores': data}

    if request.user.is_authenticated:
        context['usr'] = usr
    
    return render(request, 'highscore/table.html', context=context)
