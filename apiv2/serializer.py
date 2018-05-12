from core.models import SnakeVersion
from rest_framework.serializers import ModelSerializer

class SnakeVersionSerializer(ModelSerializer):
    class Meta:
        model = SnakeVersion
        fields = ('id', 'parent', 'version', 'created',
                  'comment', 'server_error_message')
