from django.urls import path
from . import views as highscore_views

urlpatterns = [
    path('maxage', highscore_views.maxage, name='highscore_maxage'),
    path('consumerate', highscore_views.consumerate, name='highscore_consumerate'),
    path('', highscore_views.score, name='highscore'),
]
