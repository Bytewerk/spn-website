from django.urls import include, path
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .views import SnakeVersionViewSet, UserProfileKeyView

router = DefaultRouter()
router.register(r'version', SnakeVersionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('viewer_key', UserProfileKeyView.as_view()),
]