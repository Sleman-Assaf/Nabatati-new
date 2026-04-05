from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class PlantDiagnose(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='diagnosis_images/', null=True, blank=True)  # ✅ إضافة هذا السطر
    image_mongo_id = models.TextField()
    diagnosis_result = models.TextField()
    confidence_score = models.FloatField(null=True, blank=True)  # 👈 أضف هذا السطر

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis for {self.user.username} at {self.created_at}"

