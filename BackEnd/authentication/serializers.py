
from rest_framework import serializers
from .models import Report
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetTokenSerializer(serializers.Serializer):
    # These fields depend on how you implement the reset confirmation logic
    # Often includes token, uid, new_password, confirm_new_password
    email = serializers.EmailField(required=True) # Added email based on original views.py
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    # confirm_new_password = serializers.CharField(required=True, style={'input_type': 'password'})

    # Add validation if using confirm_new_password:
    # def validate(self, data):
    #     if data['new_password'] != data['confirm_new_password']:
    #         raise serializers.ValidationError("New passwords must match.")
    #     return data

class ResendVerificationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__' 

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }

        user = User.objects.filter(email=credentials['email']).first()
        if user is None or not user.check_password(credentials['password']):
            raise serializers.ValidationError('البريد الإلكتروني أو كلمة المرور غير صحيحة')

        if not user.is_email_verified:
            raise serializers.ValidationError('يرجى التحقق من البريد الإلكتروني قبل تسجيل الدخول.')

        # ✅ تحقق من حالة المهندس
        if user.role == 'engineer' and user.status != 1:
            raise serializers.ValidationError('حسابك قيد المراجعة من قبل الإدارة، يرجى الانتظار حتى يتم تفعيله.')

        data = super().validate({
            'email': user.email,
            'password': credentials['password']
        })
        return data

    

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class EngineerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'name',
            'password',
            'specialization',
            'membership_number',
            'cv_file'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')

        # تأكد أنك لا تستخدم create_user إذا لم يكن مخصصًا
        user = User(**validated_data)
        user.set_password(password)

        # تعيين الدور والحالة للمهندس
        user.role = 'engineer'
        user.status = 0  # Pending
        user.is_active = True  # تفعيل الحساب إن أردت
        user.save()
        return user

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')  # عدّل حسب الحاجة

User = get_user_model()

class EngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')  # عدّل الحقول حسب الحاجة
User = get_user_model()

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("New passwords must match.")
        return data