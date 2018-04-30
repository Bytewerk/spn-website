from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import BooleanField, Case, Max, Value, When
from django.forms import ModelForm
from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponseBadRequest
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
import json
from core.models import SnakeVersion, ActiveSnake, ServerCommand, UserProfile


def get_user_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


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
    snake = SnakeVersion(version=0, user=request.user)
    snake.code = render_to_string('ide/initial-bot.lua')
    return snake_edit(request, snake)


@login_required
def snake_edit_latest(request):
    try:
        snake = SnakeVersion.objects.filter(user=request.user).latest('created')
        return snake_edit(request, snake)
    except SnakeVersion.DoesNotExist:
        return snake_create(request)


@login_required
def snake_edit_version(request, snake_version_id):
    snake = SnakeVersion.objects.get(pk=snake_version_id)
    if snake.user != request.user:
        raise PermissionDenied
    return snake_edit(request, snake)


@login_required
def snake_save(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    json_req = json.loads(request.body)
    allowed_actions = ['run', 'save']
    action = json_req['action']
    if action not in allowed_actions:
        return HttpResponseBadRequest('unknown or undefined action')

    if 'code' not in json_req:
        return HttpResponseBadRequest('code not defined')

    code = json_req['code']
    # TODO syntax check lua code?

    if 'comment' in json_req:
        comment = json_req['comment']
    else:
        comment = None

    new_version_numer = (SnakeVersion.objects.filter(user=request.user).aggregate(Max('version'))['version__max'] or 0) + 1
    snake = SnakeVersion(user=request.user, code=code, comment=comment, version=new_version_numer)
    snake.save()

    obj, _ = ActiveSnake.objects.filter(user=request.user).get_or_create(defaults={'user': request.user, 'version': snake})
    obj.version = snake

    obj.save()
    send_kill_command(request.user)

    return JsonResponse({'success': True, 'snake_id': snake.id})


def send_kill_command(user):
    cmd = ServerCommand(user=user, command='kill')
    cmd.save()


def snake_edit(request, snake):
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

        send_kill_command(request.user)
        return redirect('snake_edit', snake_id=new_version.id)

    return render(request, 'ide/edit2.html', {'form': form, 'snake': snake, 'profile': get_user_profile(request.user)})


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
