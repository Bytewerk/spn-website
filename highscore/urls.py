from django.urls import path
from . import views as highscore_views

urlpatterns = [
    path('', highscore_views.table, name='highscore_table')
]
