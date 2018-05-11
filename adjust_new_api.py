import re
from core.models import UserProfile, SnakeVersion

for up in UserProfile.objects.all():
    if up.active_snake is None:
        continue

    old_version = up.active_snake
    code = old_version.code

    comment = "automagically converted to use new standard pairs() api"
    new_code = "-- " + comment
    new_code += re.sub(r'(\w+)\:pairs\(\)', r'pairs(\1)', code)


    new_version = SnakeVersion(
        user=up.user,
        code=new_code,
        comment=comment,
        parent=old_version
    )
    new_version.save()
    up.active_snake = new_version
    up.save()
