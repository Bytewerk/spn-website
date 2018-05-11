from django.shortcuts import render
from django.db.models import F, Max, ExpressionWrapper, FloatField
from core.models import SnakeGame
from django.db import models

def sattr(obj, attr, val):
    if isinstance(obj, dict):
        obj[attr] = val
    else:
        setattr(obj, attr, val)

def gattr(obj, attr):
    if type(obj) is dict:
        return obj[attr]
    else:
        return getattr(obj, attr)


def table(request, data, usr, title, rotate):
    i = 0
    for d in data:
        sattr(d, 'position', '{}.'.format(i+1))
        if request.user.is_authenticated and gattr(d, 'user__username') == request.user.username:
            sattr(usr, 'position', gattr(d, 'position'))
        i = i + 1

    context={'highscores': data, 'title': title}

    if request.user.is_authenticated:
        context['usr'] = usr
    
    if request.GET.get('rotate'):
        context['rotate'] = rotate

    return render(request, 'highscore/table.html', context=context)

def score(request):
    data = SnakeGame.objects.values('user__username').annotate(score=Max('final_mass')).order_by('-score')
    if request.user.is_authenticated:
        usr = SnakeGame.objects.filter(user=request.user).aggregate(score=Max('final_mass'))
    else:
        usr = False
    return table(request, data, usr, 'Highscore', 'highscore_maxage')

def maxage(request):
    data = SnakeGame.objects.values('user__username').annotate(score=Max(F('end_frame')-F('start_frame'))).order_by('-score')

    if request.user.is_authenticated:
        usr = SnakeGame.objects.filter(user=request.user).aggregate(score=Max(F('end_frame')-F('start_frame')))
    else:
        usr = False
    return table(request, data, usr, 'Max Age', 'highscore_consumerate')

def consumerate(request):
    data = SnakeGame.objects.values('user__username').annotate(
        score=Max(ExpressionWrapper(
            (F('natural_food_consumed') + F('carrison_food_consumed') + F('hunted_food_consumed'))
            / (F('end_frame') - F('start_frame')), output_field=models.FloatField())
        )
    ).order_by('-score')

    if request.user.is_authenticated:
        usr = data.filter(user__username=request.user.username)[0]
    else:
        usr = False
    return table(request, data, usr, 'Consume Rate', 'highscore')
