from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import PermissionDenied
from django.db.models import BooleanField, Case, Max, Value, When
from django.forms import ModelForm, TextInput
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404

from core.models import SnakeVersion, ActiveSnake


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

@login_required
def snake_list(request):
    return render(request, 'snake/list.html', {
        'snakes': SnakeVersion.objects.filter(user=request.user).annotate(
                active=Case(
                    When(activesnake__version_id__isnull=False, then=Value(1)),
                    default=Value(0),
                    output_field=BooleanField(),
                ),
            ).order_by('-version'),
        'has_active': bool(len(ActiveSnake.objects.filter(user=request.user)))
    })

class CreateSnakeForm(ModelForm):
    class Meta:
        model = SnakeVersion
        fields = ['code', 'comment']

@login_required
def snake_create(request):
    return snake_edit(request)

@login_required
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
        return snake_list(request)

    return render(request, 'snake/edit.html', {'form': form, 'snake': snake})

@login_required
def snake_delete(request, snake_id=-1):
    try:
        snake = SnakeVersion.objects.get(pk=snake_id)
    except SnakeVersion.DoesNotExist:
        raise PermissionDenied

    if snake.user != request.user:
        raise PermissionDenied

    snake.delete()

    return snake_list(request)

@login_required
def snake_activate(request, snake_id=-1):
    if not request.is_ajax():
        return JsonResponse({'message': 'ohh'}, status=500)

    try:
        snake = SnakeVersion.objects.filter(user=request.user).get(pk=snake_id)
    except SnakeVersion.DoesNotExist:
        return JsonResponse({'message': 'Snake could not activated'}, status=500)

    if snake.user != request.user:
        return JsonResponse({'message': 'Snake could not activated'}, status=500)

    obj, _ = ActiveSnake.objects.filter(user=request.user).get_or_create(defaults={'user': snake.user, 'version': snake})
    obj.version = snake
    obj.save()

    return JsonResponse({'message': 'Snake {} was activated'.format(snake.version)})

@login_required
def snake_disable(request):
    obj = ActiveSnake.objects.filter(user=request.user)
    if obj:
        response = {'message': 'Snake {} was disabled'.format(obj[0].version.version)}
        obj.delete()

    if request.is_ajax():
        return JsonResponse(response)
    else:
        return snake_list(request)

