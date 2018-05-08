import json
from core.models import ApiKey, SnakeVersion
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404


def get_user(request):
    try:
        key = request.META.get('HTTP_AUTHORIZATION', None)
        if key is not None:
            return ApiKey.objects.get(key=key)

        key = request.POST.get('token', None) or request.GET.get('token', None)
        if key is not None:
            return ApiKey.objects.get(key=key)

        if request.user:
            return request.user

        raise PermissionDenied('API access needs login or api key')

    except ApiKey.DoesNotExist:
        raise PermissionDenied('invalid API key')


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


def version(request):
    if request.method in ['PUT', 'POST']:
        return put_version(request)
    elif request.method == 'GET':
        return JsonResponse({ 'versions': [version_dict(v) for v in SnakeVersion.objects.filter(user=get_user(request))]})
    return HttpResponseNotAllowed(permitted_methods=['GET', 'PUT', 'POST'])


def get_version(request, version_id):
    user = get_user(request)
    v = get_object_or_404(SnakeVersion, user=user, id=version_id)
    return JsonResponse(full_version_dict(v))


def put_version(request):
    user = get_user(request)
    permitted_methods = ['PUT', 'POST']
    if request.method not in permitted_methods:
        return HttpResponseNotAllowed(permitted_methods=permitted_methods)

    data = json.loads(request.body)
    if not isinstance(data, dict):
        return HttpResponseBadRequest('need to send a json dict as request body')

    v = SnakeVersion()
    v.user = user
    v.parent = data.get('parent', None)
    v.comment = data.get('comment', None)
    v.code = data.get('code', None)
    if v.code is None:
        return HttpResponseBadRequest('need to provide lua script in code field');
    v.save()
    return get_version(request, version_id=v.id)
