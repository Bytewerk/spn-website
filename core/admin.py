from django.contrib import admin

from core.models import SnakeVersion, SnakeGame, ServerCommand, UserProfile, ApiKey

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'active_snake')

class SnakeVersionAdmin(admin.ModelAdmin):
    list_display = ('user', 'version')
    list_filter = ('user',)

class ServerCommandAdmin(admin.ModelAdmin):
    list_display = ('user', 'dt_created', 'dt_processed', 'command', 'result', 'result_msg')

admin.site.register(SnakeVersion, SnakeVersionAdmin)
admin.site.register(SnakeGame)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(ApiKey)
admin.site.register(ServerCommand, ServerCommandAdmin)
