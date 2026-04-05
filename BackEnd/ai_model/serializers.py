from rest_framework import serializers
from .models import PlantDiagnose  # ✅ هذا هو المطلوب

class ImageDiagnosisRequestSerializer(serializers.Serializer):
    image = serializers.ImageField()

class ImageDiagnosisResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    disease_type = serializers.CharField(allow_null=True, required=False)
    confidence = serializers.FloatField()

class PlantDiagnoseListSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PlantDiagnose
        fields = '__all__' 
         # أو ['id', 'plant_name', 'diagnosis_status', ...]
      


# from .models import PlantDiagnose
# from rest_framework import serializers

# class PlantDiagnoseSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()

#     class Meta:
#         model = PlantDiagnose
#         fields = ['id', 'image_url', 'diagnosis_result', 'created_at']

#     def get_image_url(self, obj):
#         request = self.context.get('request')
#         if obj.image_file:
#             return request.build_absolute_uri(obj.image_file.url)
#         return None
# from rest_framework import serializers
# from .models import PlantDiagnose

# class PlantDiagnoseListSerializer(serializers.ModelSerializer):
#     formatted_confidence = serializers.ReadOnlyField()
#     time_since_diagnosis = serializers.ReadOnlyField()
#     image_url = serializers.SerializerMethodField()
    
#     class Meta:
#         model = PlantDiagnose
#         fields = [
#             'id', 'plant_name', 'diagnosis_status', 'disease_type',
#             'confidence_score', 'formatted_confidence', 'created_at',
#             'time_since_diagnosis', 'image_url', 'is_favorite', 'notes'
#         ]
    
#     def get_image_url(self, obj):
#         if obj.image_file:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.image_file.url)
#         return None



