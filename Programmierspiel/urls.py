from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from core import views as core_views

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('admin/', admin.site.urls),
    path('signup/', core_views.signup, name='signup'),
    path('login/', auth_views.login, {'template_name': 'login.html'}, name='login'),
    path('logout/', auth_views.logout, {'next_page': 'login'}, name='logout'),
    path('watch/', TemplateView.as_view(template_name='visualization/watch.html'), name='watch'),
    path('accounts/profile/', RedirectView.as_view(url='/', permanent=False)),
    path('snake/', include('ide.urls')),
    path('highscore/', include('highscore.urls')),
    path('docs/', include('docs.urls')),
]
