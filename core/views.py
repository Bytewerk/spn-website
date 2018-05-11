from django import forms
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from core.models import get_user_profile

class MyUserCreationForm(UserCreationForm):
    username = forms.CharField(
        max_length=30,
        help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.',
    )

def signup(request):
    if request.method == 'POST':
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('snake_create')
    else:
        form = MyUserCreationForm()
    return render(request, 'signup.html', {'form': form})


@login_required
def profile(request):
    return render(request, 'core/profile.html', {'user': request.user, 'profile': get_user_profile(request.user)})


@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'core/change_password.html', {
        'form': form
    })