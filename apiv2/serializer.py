from core.models import SnakeVersion, UserProfile
from rest_framework.serializers import ModelSerializer

class SnakeVersionSerializer(ModelSerializer):
    class Meta:
        model = SnakeVersion
        fields = ('id', 'parent', 'version', 'created',
                  'comment', 'server_error_message')

class UserProfileKeySerializer(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('viewer_key',)