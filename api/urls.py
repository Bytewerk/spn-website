from django.urls import path
from . import views

urlpatterns = [
    path('version', views.version, name='version'),
    path('version/<int:version_id>', views.get_version, name='get_version'),
    path('version/active', views.get_active_version, name='get_active_version'),
    path('version/active/disable', views.disable_active_version, name='disable_active_version'),
    path('version/<int:version_id>/disable', views.disable_version, name='disable_version'),
    path('version/active/kill', views.kill_bot, name='kill_bot'),

    path('version/activate/<int:version_id>', views.activate_version, name='activate_version'),
    path('viewer_key', views.get_viewer_key, name='get_viewer_key'),

    path('keys', views.list_api_keys, name='api_keys_list'),
    path('keys/create', views.create_api_key, name='api_key_create'),
    path('keys/delete/<int:key_id>', views.delete_api_key, name='api_key_delete'),
]
