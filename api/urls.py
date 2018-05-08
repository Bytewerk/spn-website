from django.urls import path
from . import views

urlpatterns = [
    path('version', views.version, name='version'),
    path('version/<int:version_id>', views.get_version, name='get_version'),
]
