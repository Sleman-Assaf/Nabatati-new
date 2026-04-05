
# from django.db import models
# from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
# from django.utils import timezone

# # ------------------------
# # User Manager
# # ------------------------

# class CustomUserManager(BaseUserManager):
#     def create_user(self, email, name, password=None, **extra_fields):
#         if not email:
#             raise ValueError('The Email field must be set')
#         email = self.normalize_email(email)
#         user = self.model(email=email, name=name, **extra_fields)
        
#         if password:
#             user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, name, password=None, **extra_fields):
#         extra_fields.setdefault('role', 'admin')
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_email_verified', True)
        
#         return self.create_user(email, name, password, **extra_fields)

# # ------------------------
# # CustomUser Model
# # ------------------------

# class CustomUser(AbstractBaseUser, PermissionsMixin):
#     email = models.EmailField(unique=True)
#     name = models.CharField(max_length=100)
#     password = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)

#     # Email verification
#     is_email_verified = models.BooleanField(default=False)
#     email_verification_token = models.CharField(max_length=100, null=True, blank=True)
#     email_verification_token_expires_at = models.DateTimeField(null=True, blank=True)

#     # Role
#     USER_ROLES = (
#         ('user', 'Regular User'),
#         ('engineer', 'Engineer'),
#         ('admin', 'Administrator'),
#     )
#     role = models.CharField(max_length=20, choices=USER_ROLES, default='user')
#     auth_provider = models.CharField(max_length=20, default='email')

#     # Engineer-specific fields
#     status = models.IntegerField(null=True, blank=True)  # 0: Pending, 1: Active, 2: Suspended
#     specialization = models.CharField(max_length=255, null=True, blank=True)
#     membership_number = models.CharField(max_length=50, null=True, blank=True, unique=True)
#     cv_file = models.FileField(upload_to='cv_files/', null=True, blank=True)

#     objects = CustomUserManager()

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = ['name']

#     def __str__(self):
#         return f"{self.name} ({self.role})"

#     def save(self, *args, **kwargs):
#         if self.role == 'engineer':
#             if self.status is None:
#                 self.status = 0
#             if self.status not in (0, 1, 2):
#                 self.status = 0
#         super().save(*args, **kwargs)

# # ------------------------
# # Report Model
# # ------------------------

# class Report(models.Model):
#     REPORT_TYPES = (
#         ('abuse', 'Abuse'),
#         ('delay', 'Delay'),
#         ('wrong_info', 'Wrong Information'),
#     )

#     reporter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_filed')
#     engineer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_received',
#                                  limit_choices_to={'role': 'engineer'})
#     content = models.TextField()
#     category = models.CharField(max_length=20, choices=REPORT_TYPES)
#     created_at = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"Report by {self.reporter.name} on {self.engineer.name} - {self.category}"
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# ------------------------
# User Manager
# ------------------------

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        
        return self.create_user(email, name, password, **extra_fields)

# ------------------------
# CustomUser Model
# ------------------------

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    password = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Email verification
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, null=True, blank=True)
    email_verification_token_expires_at = models.DateTimeField(null=True, blank=True)

    # Role
    USER_ROLES = (
        ('user', 'Regular User'),
        ('engineer', 'Engineer'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=USER_ROLES, default='user')
    auth_provider = models.CharField(max_length=20, default='email')

    # Engineer-specific fields
    status = models.IntegerField(null=True, blank=True)  # 0: Pending, 1: Active, 2: Suspended
    specialization = models.CharField(max_length=255, null=True, blank=True)
    membership_number = models.CharField(max_length=50, null=True, blank=True, unique=True)
    cv_file = models.FileField(upload_to='cv_files/', null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name} ({self.role})"

    def save(self, *args, **kwargs):
        if self.role == 'engineer':
            if self.status is None:
                self.status = 0
            if self.status not in (0, 1, 2):
                self.status = 0
        super().save(*args, **kwargs)

# ------------------------
# Report Model
# ------------------------

class Report(models.Model):
    REPORT_TYPES = (
        ('abuse', 'Abuse'),
        ('delay', 'Delay'),
        ('wrong_info', 'Wrong Information'),
    )

    reporter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_filed')
    engineer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_received',
                                 limit_choices_to={'role': 'engineer'})
    content = models.TextField()
    category = models.CharField(max_length=20, choices=REPORT_TYPES)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Report by {self.reporter.name} on {self.engineer.name} - {self.category}"
