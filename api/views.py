import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.forms import ModelForm
from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from core.models import ApiKey, SnakeVersion, ServerCommand, get_user_profile

class bot_api(object):
    def __init__(self, f):
        self.f = f

    def __call__(self, request, *args, **kwargs):
        try:
            key = request.META.get('HTTP_AUTHORIZATION', None) or request.GET.get('token', None) or None

            if key is not None:
                request.user = ApiKey.objects.get(key=key)

            # raise(NotImplementedError(str(type(request.user))))
            if request.user and not request.user.is_anonymous:
                return self.f(request, *args, **kwargs)
            else:
                raise ApiKey.DoesNotExist

        except ApiKey.DoesNotExist:
            raise PermissionDenied('Unauthorized: not logged in or no / invalid api key given')


def version_dict(v):
    return {
        'id': v.id,
        'parent': None if v.parent is None else v.parent.id,
        'version': v.version,
        'created': v.created,
        'comment': v.comment,
        'error': v.server_error_message
    }


def full_version_dict(v):
    d = version_dict(v)
    d['code'] = v.code
    return d


@require_http_methods(['GET', 'POST', 'PUT'])
@bot_api
def version(request):
    if request.method in ['PUT', 'POST']:
        return put_version(request)
    else:
        return JsonResponse({'versions': [version_dict(v) for v in SnakeVersion.objects.filter(user=request.user)]})


@require_http_methods(['GET'])
@bot_api
def get_version(request, version_id):
    v = get_object_or_404(SnakeVersion, user=request.user, id=version_id)
    return JsonResponse(full_version_dict(v))


@require_http_methods(['POST', 'PUT'])
@bot_api
def put_version(request):
    data = json.loads(request.body)
    if not isinstance(data, dict):
        return HttpResponseBadRequest('need to send a json dict as request body')

    v = SnakeVersion()
    v.user = request.user
    v.parent = data.get('parent', None)
    v.comment = data.get('comment', None)
    v.code = data.get('code', None)
    if v.code is None:
        return HttpResponseBadRequest('need to provide lua script in code field');
    v.save()
    return get_version(request, version_id=v.id)


@require_http_methods(['GET'])
@bot_api
def get_active_version(request):
    up = get_user_profile(request.user)
    v = up.active_snake
    if v:
        return get_version(request, version_id=v.id)
    else:
        return JsonResponse({})


@require_http_methods(['POST'])
@bot_api
def activate_version(request, version_id):
    v = get_object_or_404(SnakeVersion, user=request.user, id=version_id)
    up = get_user_profile(request.user)
    up.active_snake = v
    up.save()
    return JsonResponse(version_dict(v))


@require_http_methods(['POST'])
@bot_api
def disable_active_version(request):
    up = get_user_profile(request.user)
    up.active_snake = None
    up.save()
    return JsonResponse({'result': 'ok'})


@require_http_methods(['POST'])
@bot_api
def disable_version(request, version_id):
    up = get_user_profile(request.user)
    if up.active_snake is not None and up.active_snake.id == version_id:
        up.active_snake = None
        up.save()
    return JsonResponse({'result': 'ok'})


@require_http_methods(['POST', 'DELETE'])
@bot_api
def kill_bot(request):
    ServerCommand(user=request.user, command='kill').save()
    return JsonResponse({'result': 'ok'})


@require_http_methods(['GET'])
@bot_api
def get_viewer_key(request):
    up = get_user_profile(request.user)
    return JsonResponse({'viewer_key': up.viewer_key})

######################
# API KEY MANAGEMENT #
######################
@require_http_methods(['GET'])
@login_required()
def list_api_keys(request):
    return render(request, 'api/list_api_keys.html', {
        'user': request.user,
        'max_keys': ApiKey.MAX_KEYS_PER_USER
    })


class CreateKeyForm(ModelForm):
    class Meta:
        model = ApiKey
        fields = ['comment']


@require_http_methods(['POST'])
@login_required()
def create_api_key(request):
    if request.user.apikey_set.count() >= ApiKey.MAX_KEYS_PER_USER:
        raise SuspiciousOperation

    form = CreateKeyForm(request.POST or None)
    if form.is_valid():
        key = ApiKey(user=request.user)
        key.comment = form.cleaned_data.get('comment', None)
        key.save()
    return redirect('api_keys_list')


@require_http_methods(['POST', 'DELETE'])
@login_required()
def delete_api_key(request, key_id):
    key = get_object_or_404(ApiKey, user=request.user, id=key_id)
    key.delete()
    return redirect('api_keys_list')
