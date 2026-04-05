

# Create your views here.
##def Home(request):
  #  return render(request, 'Home/home.html')

# Home/views.py
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore

# Home/views.py
from django.http import JsonResponse

def home_api(request):
    return JsonResponse({'message': 'Welcome to the Home API'})

