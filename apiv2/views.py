from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, mixins
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.serializers import BaseSerializer
from core.models import SnakeVersion, UserProfile, ServerCommand
from .serializer import SnakeVersionSerializer, UserProfileKeySerializer

class SnakeVersionViewSet(mixins.CreateModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SnakeVersionSerializer
    queryset = SnakeVersion.objects.none()  # Required for DjangoModelPermissions

    def get_serializer_class(self):
        if self.action == 'activate' and self.request.method == 'POST':
            return BaseSerializer
        return SnakeVersionSerializer

    def get_queryset(self, *args, **kwargs):
        return SnakeVersion.objects.all().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False)
    def active(self, request, *args, **kwargs):
        snake_version = UserProfile.objects.all().filter(user=self.request.user).first().active_snake
        serial = self.serializer_class(snake_version)
        return Response(serial.data)

    @action(detail=False, url_name='active/disable')
    def disable(self, request, *args, **kwargs):
        up, _ = UserProfile.objects.get_or_create(user=request.user)
        up.active_snake = None
        up.save()
        return Response({'result': 'ok'})

    @action(detail=False, url_name='active/kill')
    def kill(self, request, *args, **kwargs):
        ServerCommand(user=request.user, command='kill').save()
        return Response({'result': 'ok'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        v = get_object_or_404(SnakeVersion, user=request.user, id=pk)
        up, _ = UserProfile.objects.get_or_create(user=request.user)
        up.active_snake = v
        up.save()
        serial = self.serializer_class(v)
        return Response(serial.data)

class UserProfileKeyView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileKeySerializer

    def get(self, request, *args, **kwargs):
        up = UserProfile.objects.filter(user=self.request.user).first()
        serial = self.serializer_class(up)
        return Response(serial.data)