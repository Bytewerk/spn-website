from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import SnakeVersion
from .serializer import SnakeVersionSerializer

class SnakeVersionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SnakeVersionSerializer

    queryset = SnakeVersion.objects.none()  # Required for DjangoModelPermissions

    def get_queryset(self, *args, **kwargs):
        return SnakeVersion.objects.all().filter(user=self.request.user)
