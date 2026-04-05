from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from .views import AdminReportListView

from .views import (
    CustomTokenObtainPairView,
    UserRegisterView,
    EngineerRegisterView,
    UserDetailView,
    ChangePasswordView,
    LogoutView,
    RequestPasswordResetView,
    PasswordResetConfirmView,
    VerifyEmailView,
    ResendVerificationEmailView
)

class GoogleLogin(SocialLoginView): # type: ignore
    adapter_class = GoogleOAuth2Adapter # type: ignore

urlpatterns = [
    # Authentication endpoints
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegisterView.as_view(), name='user_register'),
    path('register/engineer/', EngineerRegisterView.as_view(), name='engineer_register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # User profile endpoints
    path('profile/', UserDetailView.as_view(), name='user_detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Email verification endpoints
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification-email/', ResendVerificationEmailView.as_view(), name='resend_verification_email'),
    
    # Password reset endpoints
    path('password-reset/request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),


  


    path('admin/reports/', AdminReportListView.as_view(), name='admin_reports'),


    
    # Google signin
    path("google/", GoogleLogin.as_view(), name="google_login"),
]
