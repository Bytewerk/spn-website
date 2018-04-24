from django.contrib import admin

from core.models import SnakeGame, ServerCommand

admin.site.register(SnakeGame)


class ServerCommandAdmin(admin.ModelAdmin):
    list_display = ('user', 'dt_created', 'dt_processed', 'command', 'result', 'result_msg')

admin.site.register(ServerCommand, ServerCommandAdmin)
