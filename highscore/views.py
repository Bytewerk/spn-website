from django.shortcuts import render
from .models import Highscore

def table(request):
    output = Highscore.objects.all()

    # listing macro
    #return render(request, 'highscore/outputtable.html', {'object': output, 'model_table_attrs': ['user_id', 'score']})

    return render(request, 'highscore/table.html', context={'highscores': output})