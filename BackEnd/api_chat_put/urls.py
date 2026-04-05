from django.urls import path
from .views import AskGeminiAPIView


urlpatterns = [
    path('ask/', AskGeminiAPIView.as_view(), name='ask_gemini'),
]