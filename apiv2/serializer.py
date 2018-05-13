from core.models import SnakeVersion, UserProfile
from rest_framework.serializers import ModelSerializer


class SnakeVersionSerializer(ModelSerializer):
    class Meta:
        model = SnakeVersion
        fields = ('id', 'parent', 'version', 'created',
                  'comment', 'server_error_message', 'code')
        extra_kwargs = {'id': {'read_only': True}, 
                  'parent': {'read_only': True}, 
                  'version': {'read_only': True}, 
                  'created': {'read_only': True},
                  'server_error_message': {'read_only': True},
                  'code': {'write_only': True}}

class UserProfileKeySerializer(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('viewer_key',)
