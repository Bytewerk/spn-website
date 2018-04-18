from django.urls import path
from . import views as docs_views

urlpatterns = [
    path('', docs_views.docs, name='docs')
]
