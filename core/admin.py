from django.contrib import admin

from core.models import SnakeVersion, ActiveSnake, SnakeGame, ServerCommand

admin.site.register(SnakeVersion)
admin.site.register(ActiveSnake)
admin.site.register(SnakeGame)


class ServerCommandAdmin(admin.ModelAdmin):
    list_display = ('user', 'dt_created', 'dt_processed', 'command', 'result', 'result_msg')

admin.site.register(ServerCommand, ServerCommandAdmin)
