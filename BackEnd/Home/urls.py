#from django.urls import path
#from .import views
#urlpatterns=[
#
   # path('',views.Home,name='Home')
# Home/urls.py
# في ملف urls.py في Django
from django.urls import path
from . import views

urlpatterns = [
    path('api/home/', views.home_api, name='home-api'),
]
