# from django.contrib.auth import get_user_model
# from rest_framework import generics, permissions, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework_simplejwt.tokens import RefreshToken
# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
# from dj_rest_auth.registration.views import SocialLoginView
# from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
# from django.contrib.auth.tokens import default_token_generator
# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from django.utils.encoding import force_bytes, force_str
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta
# import secrets
# import string
# from .serializers import ReportSerializer
# from .permissions import IsAdmin
# from .models import Report

# from .serializers import (
#     CustomTokenObtainPairSerializer,
#     UserRegisterSerializer,
#     EngineerRegisterSerializer,
#     UserSerializer,
#     EngineerSerializer,
#     AdminSerializer,
#     ChangePasswordSerializer,
#     RequestPasswordResetSerializer,
#     PasswordResetTokenSerializer,
#     ResendVerificationEmailSerializer
# )

# class GoogleLoginView(SocialLoginView):
#     adapter_class = GoogleOAuth2Adapter

# User = get_user_model()

# def generate_verification_token():
#     """
#     توليد رمز تحقق عشوائي
#     """
#     alphabet = string.ascii_letters + string.digits
#     token = ''.join(secrets.choice(alphabet) for i in range(64))
#     return token

# def send_verification_email(user):
#     """
#     إرسال بريد إلكتروني للتحقق من البريد الإلكتروني
#     """
#     # إنشاء رمز تحقق جديد
#     token = generate_verification_token()
    
#     # تخزين الرمز وتاريخ انتهاء الصلاحية (24 ساعة من الآن)
#     user.email_verification_token = token
#     user.email_verification_token_expires_at = timezone.now() + timedelta(hours=24)
#     user.save()
    
#     # إنشاء رابط التحقق
#     verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
    
#     # إرسال البريد الإلكتروني
#     email_subject = "تأكيد البريد الإلكتروني"
#     email_body = f"""
#     مرحباً {user.name},
    
#     شكراً لتسجيلك في تطبيق Medical Plants. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:
    
#     {verification_url}
    
#     ينتهي هذا الرابط خلال 24 ساعة.
    
#     إذا لم تقم بالتسجيل في تطبيقنا، يرجى تجاهل هذا البريد الإلكتروني.
    
#     شكراً لك،
#     فريق Medical Plants
#     """
    
#     try:
#         send_mail(
#             email_subject,
#             email_body,
#             settings.DEFAULT_FROM_EMAIL,
#             [user.email],
#             fail_silently=False
#         )
#         return True
#     except Exception as e:
#         print(f"Error sending verification email: {e}")
#         return False

# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer

# class UserRegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     permission_classes = (AllowAny,)
#     serializer_class = UserRegisterSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
        
#         # إرسال بريد التحقق
#         send_verification_email(user)

#         refresh = RefreshToken.for_user(user)
        
#         return Response({
#             'user': serializer.data,
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#             'message': 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.'
#         }, status=status.HTTP_201_CREATED)

# class EngineerRegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     permission_classes = (AllowAny,)
#     serializer_class = EngineerRegisterSerializer
#     parser_classes = [JSONParser, MultiPartParser, FormParser]

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
        
#         # إرسال بريد التحقق
#         send_verification_email(user)
        
#         refresh = RefreshToken.for_user(user)
        
#         return Response({
#             'user': serializer.data,
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#             'message': 'تم تسجيل المهندس بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك. الحساب في انتظار الموافقة الإدارية.'
#         }, status=status.HTTP_201_CREATED)

# class VerifyEmailView(APIView):
#     """
#     التحقق من البريد الإلكتروني باستخدام الرمز
#     """
#     permission_classes = [AllowAny]

#     def get(self, request, token):
#         try:
#             # البحث عن المستخدم بواسطة الرمز
#             user = User.objects.get(email_verification_token=token)
            
#             # التحقق من أن الرمز لم تنتهِ صلاحيته
#             if user.email_verification_token_expires_at < timezone.now():
#                 return Response(
#                     {"error": "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # تحديث حالة التحقق
#             user.is_email_verified = True
#             user.email_verification_token = None
#             user.email_verification_token_expires_at = None
#             user.save()
            
#             # إعادة توجيه المستخدم إلى صفحة التأكيد
#             return Response(
#                 {"message": "تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول."},
#                 status=status.HTTP_200_OK
#             )
#         except User.DoesNotExist:
#             return Response(
#                 {"error": "رمز التحقق غير صالح."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             return Response(
#                 {"error": "حدث خطأ أثناء التحقق من البريد الإلكتروني."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ResendVerificationEmailView(APIView):
#     """
#     إعادة إرسال بريد التحقق
#     """
#     permission_classes = [AllowAny]
#     serializer_class = ResendVerificationEmailSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         email = serializer.validated_data['email']
        
#         try:
#             user = User.objects.get(email=email)
            
#             # التحقق من أن البريد الإلكتروني غير مُتحقق منه بالفعل
#             if user.is_email_verified:
#                 return Response(
#                     {"error": "البريد الإلكتروني مُتحقق منه بالفعل."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # إرسال بريد التحقق
#             if send_verification_email(user):
#                 return Response(
#                     {"message": "تم إرسال رابط التحقق إلى بريدك الإلكتروني."},
#                     status=status.HTTP_200_OK
#                 )
#             else:
#                 return Response(
#                     {"error": "حدث خطأ أثناء إرسال البريد الإلكتروني."},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
#         except User.DoesNotExist:
#             return Response(
#                 {"error": "لا يوجد مستخدم بهذا البريد الإلكتروني."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class UserDetailView(generics.RetrieveUpdateAPIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_serializer_class(self):
#         user = self.request.user
#         if user.role == 'engineer':
#             return EngineerSerializer
#         elif user.role == 'admin':
#             return AdminSerializer
#         return UserSerializer
    
#     def get_object(self):
#         return self.request.user

# class ChangePasswordView(generics.UpdateAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = ChangePasswordSerializer
    
#     def update(self, request, *args, **kwargs):
#         user = self.request.user
#         serializer = self.get_serializer(data=request.data)
        
#         if serializer.is_valid():
#             # Check old password
#             if not user.check_password(serializer.data.get("current_password")):
#                 return Response({"current_password": ["Wrong password."]}, 
#                                status=status.HTTP_400_BAD_REQUEST)
            
#             # Set new password
#             user.set_password(serializer.data.get("new_password"))
#             user.save()
#             return Response({
#                 "message": "Password updated successfully"
#             }, status=status.HTTP_200_OK)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             refresh_token = request.data["refresh_token"]
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response({"message": "Successfully logged out."}, 
#                            status=status.HTTP_205_RESET_CONTENT)
#         except Exception as e:
#             return Response({"error": "Invalid token or token not provided."},
#                            status=status.HTTP_400_BAD_REQUEST)
        
# class AdminReportListView(generics.ListAPIView):
   
#     queryset = Report.objects.all().order_by('-created_at')
#     serializer_class = ReportSerializer
#     permission_classes = [permissions.IsAuthenticated, IsAdmin]

# class RequestPasswordResetView(APIView):
#     """
#     طلب إعادة تعيين كلمة المرور عن طريق البريد الإلكتروني
#     """
#     permission_classes = [AllowAny]
#     serializer_class = RequestPasswordResetSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         email = serializer.validated_data['email']
#         user = User.objects.get(email=email)
        
#         # إنشاء رمز إعادة تعيين كلمة المرور
#         token = default_token_generator.make_token(user)
#         uid = urlsafe_base64_encode(force_bytes(user.pk))
        
#         # إنشاء رابط إعادة تعيين كلمة المرور
#         reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
#         # إرسال البريد الإلكتروني
#         email_subject = "إعادة تعيين كلمة المرور"
#         email_body = f"""
#         مرحباً {user.name},
        
#         لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:
        
#         {reset_url}
        
#         إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        
#         شكراً لك،
#         فريق Medical Plants
#         """
        
#         try:
#             send_mail(
#                 email_subject,
#                 email_body,
#                 settings.DEFAULT_FROM_EMAIL,
#                 [email],
#                 fail_silently=False
#             )
#             return Response(
#                 {"message": "Check Email To Reset your Passowrd!"},
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             return Response(
#                 {"error": "حدث خطأ أثناء إرسال البريد الإلكتروني."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class PasswordResetConfirmView(APIView):
#     """
#     تأكيد إعادة تعيين كلمة المرور باستخدام الرمز
#     """
#     permission_classes = [AllowAny]
#     serializer_class = PasswordResetTokenSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         try:
#             # استخراج معلومات المستخدم من الرمز
#             token = serializer.validated_data['token']
#             email = serializer.validated_data['email']
            
#             # البحث عن المستخدم
#             user = User.objects.get(email=email)
            
#             # التحقق من صحة الرمز
#             if not default_token_generator.check_token(user, token):
#                 return Response(
#                     {"error": "الرمز غير صالح أو منتهي الصلاحية."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # تعيين كلمة المرور الجديدة
#             user.set_password(serializer.validated_data['new_password'])
#             user.save()
            
#             return Response(
#                 {"message": "تم إعادة تعيين كلمة المرور بنجاح."},
#                 status=status.HTTP_200_OK
#             )
#         except User.DoesNotExist:
#             return Response(
#                 {"error": "لا يوجد مستخدم بهذا البريد الإلكتروني."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             return Response(
#                 {"error": "حدث خطأ أثناء إعادة تعيين كلمة المرور."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
            
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets
import string
from .serializers import ReportSerializer
from .permissions import IsAdmin
from .models import Report

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegisterSerializer,
    EngineerRegisterSerializer,
    UserSerializer,
    EngineerSerializer,
    AdminSerializer,
    ChangePasswordSerializer,
    RequestPasswordResetSerializer,
    PasswordResetTokenSerializer,
    ResendVerificationEmailSerializer
)

class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

User = get_user_model()

def generate_verification_token():
    """
    توليد رمز تحقق عشوائي
    """
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for i in range(64))
    return token

def send_verification_email(user):
    """
    إرسال بريد إلكتروني للتحقق من البريد الإلكتروني
    """
    # إنشاء رمز تحقق جديد
    token = generate_verification_token()
    
    # تخزين الرمز وتاريخ انتهاء الصلاحية (24 ساعة من الآن)
    user.email_verification_token = token
    user.email_verification_token_expires_at = timezone.now() + timedelta(hours=24)
    user.save()
    
    # إنشاء رابط التحقق
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
    
    # إرسال البريد الإلكتروني
    email_subject = "تأكيد البريد الإلكتروني"
    email_body = f"""
    مرحباً {user.name},
    
    شكراً لتسجيلك في تطبيق Medical Plants. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:
    
    {verification_url}
    
    ينتهي هذا الرابط خلال 24 ساعة.
    
    إذا لم تقم بالتسجيل في تطبيقنا، يرجى تجاهل هذا البريد الإلكتروني.
    
    شكراً لك،
    فريق Medical Plants
    """
    
    try:
        send_mail(
            email_subject,
            email_body,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # إرسال بريد التحقق
        send_verification_email(user)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.'
        }, status=status.HTTP_201_CREATED)

class EngineerRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = EngineerRegisterSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # إرسال بريد التحقق
        send_verification_email(user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'تم تسجيل المهندس بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك. الحساب في انتظار الموافقة الإدارية.'
        }, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    """
    التحقق من البريد الإلكتروني باستخدام الرمز
    """
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            # البحث عن المستخدم بواسطة الرمز
            user = User.objects.get(email_verification_token=token)
            
            # التحقق من أن الرمز لم تنتهِ صلاحيته
            if user.email_verification_token_expires_at < timezone.now():
                return Response(
                    {"error": "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # تحديث حالة التحقق
            user.is_email_verified = True
            user.email_verification_token = None
            user.email_verification_token_expires_at = None
            user.save()
            
            # إعادة توجيه المستخدم إلى صفحة التأكيد
            return Response(
                {"message": "تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "رمز التحقق غير صالح."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "حدث خطأ أثناء التحقق من البريد الإلكتروني."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ResendVerificationEmailView(APIView):
    """
    إعادة إرسال بريد التحقق
    """
    permission_classes = [AllowAny]
    serializer_class = ResendVerificationEmailSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # التحقق من أن البريد الإلكتروني غير مُتحقق منه بالفعل
            if user.is_email_verified:
                return Response(
                    {"error": "البريد الإلكتروني مُتحقق منه بالفعل."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # إرسال بريد التحقق
            if send_verification_email(user):
                return Response(
                    {"message": "تم إرسال رابط التحقق إلى بريدك الإلكتروني."},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "حدث خطأ أثناء إرسال البريد الإلكتروني."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except User.DoesNotExist:
            return Response(
                {"error": "لا يوجد مستخدم بهذا البريد الإلكتروني."},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        user = self.request.user
        if user.role == 'engineer':
            return EngineerSerializer
        elif user.role == 'admin':
            return AdminSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def update(self, request, *args, **kwargs):
        user = self.request.user
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.data.get("current_password")):
                return Response({"current_password": ["Wrong password."]}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({
                "message": "Password updated successfully"
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, 
                           status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or token not provided."},
                           status=status.HTTP_400_BAD_REQUEST)
        
class AdminReportListView(generics.ListAPIView):
   
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class RequestPasswordResetView(APIView):
    """
    طلب إعادة تعيين كلمة المرور عن طريق البريد الإلكتروني
    """
    permission_classes = [AllowAny]
    serializer_class = RequestPasswordResetSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # إنشاء رمز إعادة تعيين كلمة المرور
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # إنشاء رابط إعادة تعيين كلمة المرور
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # إرسال البريد الإلكتروني
        email_subject = "إعادة تعيين كلمة المرور"
        email_body = f"""
        مرحباً {user.name},
        
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:
        
        {reset_url}
        
        إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        
        شكراً لك،
        فريق Medical Plants
        """
        
        try:
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )
            return Response(
                {"message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "حدث خطأ أثناء إرسال البريد الإلكتروني."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmView(APIView):
    """
    تأكيد إعادة تعيين كلمة المرور باستخدام الرمز
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetTokenSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # استخراج معلومات المستخدم من الرمز
            token = serializer.validated_data['token']
            email = serializer.validated_data['email']
            
            # البحث عن المستخدم
            user = User.objects.get(email=email)
            
            # التحقق من صحة الرمز
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"error": "الرمز غير صالح أو منتهي الصلاحية."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # تعيين كلمة المرور الجديدة
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"message": "تم إعادة تعيين كلمة المرور بنجاح."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "لا يوجد مستخدم بهذا البريد الإلكتروني."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "حدث خطأ أثناء إعادة تعيين كلمة المرور."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            