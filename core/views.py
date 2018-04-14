from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import PermissionDenied
from core.models import SnakeVersion
from django.forms import ModelForm, TextInput
from django.db.models import Max, BooleanField, Case, When, Value


def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def snake_list(request):
    return render(request, 'snake/list.html', {
        'snakes': SnakeVersion.objects.filter(user=request.user).annotate(
                active=Case(
                    When(activesnake__version_id__isnull=False, then=Value(1)),
                    default=Value(0),
                    output_field=BooleanField(),
                ),
            ).order_by('-version')
    })

class CreateSnakeForm(ModelForm):
    class Meta:
        model = SnakeVersion
        fields = ['code', 'comment']

def snake_create(request):
    return snake_edit(request)

def snake_edit(request, snake_id=-1):
    try:
        snake = SnakeVersion.objects.get(pk=snake_id)
    except SnakeVersion.DoesNotExist:
        snake = SnakeVersion(version=0, user=request.user)

    if snake.user != request.user:
        raise PermissionDenied

    form = CreateSnakeForm(request.POST or None)
    if form.is_valid():

        posted_code = form.cleaned_data.get('code')
        if posted_code != snake.code:
            posted_comment = form.cleaned_data.get('comment', '')
            last_version = SnakeVersion.objects.filter(user=request.user).aggregate(Max('version'))['version__max']
            
            new_version = SnakeVersion(user=request.user,
                                       prev_version=snake.version, 
                                       version=(last_version or 0)+1,
                                       code=posted_code, 
                                       comment=posted_comment)
            new_version.save()
        return redirect('snake')

    return render(request, 'snake/edit.html', {'form': form, 'snake': snake})

def snake_delete(request, snake_id=-1):
    try:
        snake = SnakeVersion.objects.get(pk=snake_id)
    except SnakeVersion.DoesNotExist:
        raise PermissionDenied

    if snake.user != request.user:
        raise PermissionDenied

    snake.delete()

    return redirect('snake')
