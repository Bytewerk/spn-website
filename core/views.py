from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import PermissionDenied
from core.models import SnakeVersion
from django.forms import ModelForm, TextInput
from django.db.models import Max


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
        'snakes': SnakeVersion.objects.filter(user=request.user).order_by('-version')
    })

class CreateSnakeForm(ModelForm):
    class Meta:
        model = SnakeVersion
        fields = ['code', 'comment']

def snake_create(request, template_name='snake/create.html'):
    #form = CreateSnakeForm(request.POST or None)
    #if form.is_valid():
    #    snake = form.save(commit=False)
    #    snake.user = request.user
    #    snake.save()
        return redirect('snake')
    #return render(request, template_name, {'form': form})


def snake_edit(request, snake_id):
    snake = get_object_or_404(SnakeVersion, pk=snake_id)
    
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
                                       version=last_version+1,
                                       code=posted_code, 
                                       comment=posted_comment)
            new_version.save()
        return redirect('snake')

    return render(request, 'snake/edit.html', {'form': form, 'snake': snake})
