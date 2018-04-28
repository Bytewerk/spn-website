from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import BooleanField, Case, Max, Value, When
from django.forms import ModelForm
from django.http import JsonResponse
from django.shortcuts import render, redirect

from core.models import SnakeVersion, ActiveSnake, ServerCommand


@login_required
def snake_list(request):
    return render(request, 'ide/list.html', {
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
        posted_comment = form.cleaned_data.get('comment', '')
        last_version = SnakeVersion.objects.filter(user=request.user).aggregate(Max('version'))['version__max']

        new_version = SnakeVersion(user=request.user,
                                   prev_version=snake.version,
                                   version=(last_version or 0) + 1,
                                   code=posted_code,
                                   comment=posted_comment)
        new_version.save()

        obj, _ = ActiveSnake.objects.filter(user=request.user).get_or_create(defaults={'user': request.user, 'version': new_version})
        obj.version = new_version
        obj.save()

        cmd = ServerCommand(
            user=request.user,
            command='kill'
        )
        cmd.save()

        return redirect('snake_edit', snake_id=new_version.id)

    return render(request, 'ide/edit2.html', {'form': form, 'snake': snake})


@login_required
def snake_delete(request, snake_id=-1):
    try:
        snake = SnakeVersion.objects.get(pk=snake_id)
    except SnakeVersion.DoesNotExist:
        raise PermissionDenied

    if snake.user != request.user:
        raise PermissionDenied

    snake.delete()

    return redirect('snake')


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

    obj, _ = ActiveSnake.objects.filter(user=request.user).get_or_create(
        defaults={'user': snake.user, 'version': snake})
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
        return redirect('snake')


@login_required
def snake_restart(request):
    obj = ActiveSnake.objects.filter(user=request.user)
    if obj:
        response = {'message': 'Restart signal send for Snake {}'.format(obj[0].version.version)}

        cmd = ServerCommand(
            user=request.user,
            command='kill'
        )
        cmd.save()

    if request.is_ajax():
        return JsonResponse(response)
    else:
        return snake_list(request)
