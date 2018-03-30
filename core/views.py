from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import PermissionDenied
from core.models import Snake, SnakeVersion
from django.forms import ModelForm, TextInput


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


class CreateSnakeForm(ModelForm):
    class Meta:
        model = Snake
        fields = ['name']


def snake_list(request):
    return render(request, 'snake/list.html', {
        'snakes': Snake.objects.filter(user=request.user)
    })


def snake_create(request, template_name='snake/create.html'):
    form = CreateSnakeForm(request.POST or None)
    if form.is_valid():
        snake = form.save(commit=False)
        snake.user = request.user
        snake.save()
        return redirect('snake')
    return render(request, template_name, {'form': form})


def snake_edit(request, snake_id):
    snake = get_object_or_404(Snake, pk=snake_id)
    if snake.user != request.user:
        raise PermissionDenied

    try:
        version = snake.snakeversion_set.latest('created')
        code = version.code
    except SnakeVersion.DoesNotExist:
        code = ''

    form = CreateSnakeForm(request.POST or None, instance=snake)
    if form.is_valid():
        snake = form.save()

        posted_code = request.POST['code']
        if posted_code != code:
            new_version = SnakeVersion(snake=snake, code=request.POST['code'])
            new_version.save()
        return redirect('snake')

    return render(request, 'snake/edit.html', {'form': form, 'snake': snake, 'code': code})
