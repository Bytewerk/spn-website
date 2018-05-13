from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from core.models import SnakeVersion, UserProfile
from .serializer import SnakeVersionSerializer

class SnakeVersionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SnakeVersionSerializer

    queryset = SnakeVersion.objects.none()  # Required for DjangoModelPermissions

    def get_queryset(self, *args, **kwargs):
        return SnakeVersion.objects.all().filter(user=self.request.user)

    @action(detail=False)
    def active(self, request, *args, **kwargs):
        snake_version = UserProfile.objects.all().filter(user=self.request.user).first().active_snake
        serial = self.serializer_class(snake_version)
        return Response(serial.data)

    @action(detail=False, url_name='active/disable')
    def disable(self, request, *args, **kwargs):
        up = UserProfile.objects.all().filter(user=self.request.user).first()
        up.active_snake = None
        up.save()
        return Response({'result': 'ok'})
