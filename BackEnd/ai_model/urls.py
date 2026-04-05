
from django.urls import path
from . views import ImageDiagnosisAPIView 

from ai_model import views
from .views import ImageDiagnosisAPIView, DiagnosisListView


urlpatterns = [
    path('model/', ImageDiagnosisAPIView.as_view(), name='image-diagnosis'),
    #  path('diagnoses/', views.get_user_diagnoses, name='user_diagnoses'),
    path('diagnose/', ImageDiagnosisAPIView.as_view(), name='image-diagnose'),
    path('diagnoses/', DiagnosisListView.as_view(), name='diagnoses-list'),
]

