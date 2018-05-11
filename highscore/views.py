from django.shortcuts import render
from django.db.models import F, Max, ExpressionWrapper, FloatField
from django.db.models.query import RawQuerySet
from core.models import SnakeGame
from django.db.models.expressions import RawSQL

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


def table(request, data, usr, title):
    i = 0
    
    for d in data:
        sattr(d, 'position', '{}.'.format(i+1)) 
        if request.user.is_authenticated and gattr(d, 'user__username') == request.user.username:
            sattr(usr, 'position', gattr(d, 'position'))
        i = i + 1

    context={'highscores': data, 'title': title}

    if request.user.is_authenticated:
        context['usr'] = usr
    
    return render(request, 'highscore/table.html', context=context)

def score(request):
    data = SnakeGame.objects.values('user__username').annotate(score=Max('final_mass')).order_by('-score')
    if request.user.is_authenticated:
        usr = SnakeGame.objects.filter(user=request.user).aggregate(score=Max('final_mass'))
    else:
        usr = False
    return table(request, data, usr, 'Highscore')

def maxage(request):
    data = SnakeGame.objects.values('user__username').annotate(score=Max(F('end_frame')-F('start_frame'))).order_by('-score')

    if request.user.is_authenticated:
        usr = SnakeGame.objects.filter(user=request.user).aggregate(score=Max(F('end_frame')-F('start_frame')))
    else:
        usr = False
    return table(request, data, usr, 'Max Age')

def consumerate(request):
    data = SnakeGame.objects.raw(
        '''SELECT 1 as "id", "auth_user"."username" as "user__username", 
            max(
                (natural_food_consumed + carrison_food_consumed + hunted_food_consumed)
                /
                (end_frame - start_frame)
               ) AS "score" 
           FROM "core_snakegame" LEFT OUTER JOIN "auth_user" 
           ON ("core_snakegame"."user_id" = "auth_user"."id")
           GROUP BY "auth_user"."username" 
           ORDER BY 
                (natural_food_consumed + carrison_food_consumed + hunted_food_consumed)
                /
                (end_frame - start_frame) DESC
        ''')

    ndata = []
    for d in data:
        ndata.append({'user__username': d.user__username, 'score': d.score})
    data = ndata
    
    if request.user.is_authenticated:
        usr = SnakeGame.objects.raw(
            '''
            SELECT 1 as "id", 
            max(
                (natural_food_consumed + carrison_food_consumed + hunted_food_consumed)
                /
                (end_frame - start_frame)
               ) AS "score" 
           FROM "core_snakegame" LEFT OUTER JOIN "auth_user" 
           ON ("core_snakegame"."user_id" = "auth_user"."id")
           WHERE "auth_user"."id" = %s
           GROUP BY "auth_user"."id"
            ''', [request.user.id]
        )[0]
    else:
        usr = False
    return table(request, data, usr, 'Consume Rate')
