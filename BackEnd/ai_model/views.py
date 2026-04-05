# # from django.shortcuts import render
# from django.http import JsonResponse
# import os
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .serializers import ImageDiagnosisRequestSerializer, ImageDiagnosisResponseSerializer
# from tensorflow.keras.preprocessing import image
# import numpy as np
# from PIL import Image as PilImage
# import logging
# from django.conf import settings

# # تفعيل تسجيل الأخطاء
# logging.basicConfig(level=logging.DEBUG)

# # تحقق من توفر TensorFlow
# try:
#     from tensorflow.keras.models import load_model
#     TENSORFLOW_AVAILABLE = True
# except ModuleNotFoundError as e:
#     TENSORFLOW_AVAILABLE = False
#     TENSORFLOW_ERROR_MESSAGE = (
#         "TensorFlow is not installed or compatible with your environment. "
#         "Please ensure you are using a Python version supported by TensorFlow. "
#         "Alternatively, you can try installing 'tensorflow-cpu' using the command: "
#         "'pip install tensorflow-cpu'."
#     )

# # ✅ مسار النموذج بشكل ديناميكي
# MAIN_MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_model', 'plant_disease_mobilenetv2_finetuned_model (3) (1).h5')

# CLASS_NAMES = [
#     "Aculus Olearius", 
#     "deficiencia",
#     "healthy", 
#     "knot disease", 
#     "negrilla", 
#     "Not Olive Plant",
#     "olive peacock spot",
#     "virosis",
# ]


# class ImageDiagnosisAPIView(APIView):
#     model = None

#     def load_model(self):
#         if self.model is None:
#             try:
#                 logging.info(f"Attempting to load model from: {MAIN_MODEL_PATH}")
#                 self.model = load_model(MAIN_MODEL_PATH)
#                 logging.info("Model loaded successfully.")
#             except FileNotFoundError:
#                 raise FileNotFoundError(
#                     f"Model file not found at: {MAIN_MODEL_PATH}. "
#                     "Please ensure the model file exists at the specified path."
#                 )
#             except Exception as e:
#                 logging.error(f"Error loading model: {e}")
#                 raise RuntimeError(f"Failed to load model: {e}")

#     def post(self, request):
#         serializer = ImageDiagnosisRequestSerializer(data=request.data)
#         if serializer.is_valid():
#             image_file = serializer.validated_data['image']

#             if not TENSORFLOW_AVAILABLE:
#                 return Response(
#                     {"error": TENSORFLOW_ERROR_MESSAGE},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )

#             try:
#                 self.load_model()

#                 img = PilImage.open(image_file).convert('RGB')
#                 img = img.resize((224, 224))
#                 img_array = image.img_to_array(img)
#                 img_array = np.expand_dims(img_array, axis=0) / 255.0

#                 predictions = self.model.predict(img_array)
#                 logging.debug(f"Model predictions: {predictions}")
#                 if len(predictions) == 0 or len(predictions[0]) == 0:
#                     raise ValueError("The model did not return any predictions.")

#                 predicted_class_index = np.argmax(predictions[0])
#                 confidence = predictions[0][predicted_class_index]

#                 if predicted_class_index >= len(CLASS_NAMES):
#                     raise IndexError(f"Predicted class index ({predicted_class_index}) is out of range for CLASS_NAMES.")

#                 predicted_class_name = CLASS_NAMES[predicted_class_index]

#                 result = {}
#                 if predicted_class_name == "healthy":
#                     result["status"] = "Healthy"
#                     result["disease_type"] = None
#                 elif predicted_class_name == "Not Olive Plant":
#                     result["status"] = "Not Olive Plant"
#                     result["disease_type"] = None
#                 else:
#                     result["status"] = "Infected"
#                     result["disease_type"] = predicted_class_name

#                 result["confidence"] = confidence.item()
#                 logging.info(f"Diagnosis result: {result}")

#                 response_serializer = ImageDiagnosisResponseSerializer(data=result)
#                 if response_serializer.is_valid():
#                     return Response(response_serializer.data, status=status.HTTP_200_OK)
#                 else:
#                     return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             except Exception as e:
#                 logging.error(f"Error during prediction: {e}")
#                 return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def get(self, request, *args, **kwargs):
#         return Response(
#             {
#                 "error": "GET method is not allowed on this endpoint.",
#                 "message": "Please use a POST request with an image file to diagnose plant diseases.",
#                 "example": {
#                     "method": "POST",
#                     "url": "/api/diagnosis/",
#                     "headers": {"Content-Type": "multipart/form-data"},
#                     "body": {"image": "Upload your image file here"}
#                 }
#             },
#             status=status.HTTP_405_METHOD_NOT_ALLOWED
#         )
# from django.shortcuts import render
# from django.http import JsonResponse
# import os
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .serializers import ImageDiagnosisRequestSerializer, ImageDiagnosisResponseSerializer
# from tensorflow.keras.preprocessing import image
# import numpy as np
# from PIL import Image as PilImage
# import logging
# from django.conf import settings
# from .models import PlantDiagnose  # ✅ إضافة الموديل لحفظ التشخيص

# # تفعيل تسجيل الأخطاء
# logging.basicConfig(level=logging.DEBUG)

# # تحقق من توفر TensorFlow
# try:
#     from tensorflow.keras.models import load_model
#     TENSORFLOW_AVAILABLE = True
# except ModuleNotFoundError as e:
#     TENSORFLOW_AVAILABLE = False
#     TENSORFLOW_ERROR_MESSAGE = (
#         "TensorFlow is not installed or compatible with your environment. "
#         "Please ensure you are using a Python version supported by TensorFlow. "
#         "Alternatively, you can try installing 'tensorflow-cpu' using the command: "
#         "'pip install tensorflow-cpu'."
#     )

# # ✅ مسار النموذج بشكل ديناميكي
# MAIN_MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_model', 'plant_disease_mobilenetv2_finetuned_model (3) (1).h5')

# CLASS_NAMES = [
#     "Aculus Olearius", 
#     "deficiencia",
#     "healthy", 
#     "knot disease", 
#     "negrilla", 
#     "Not Olive Plant",
#     "olive peacock spot",
#     "virosis",
# ]

# class ImageDiagnosisAPIView(APIView):
#     model = None

#     def load_model(self):
#         if self.model is None:
#             try:
#                 logging.info(f"Attempting to load model from: {MAIN_MODEL_PATH}")
#                 self.model = load_model(MAIN_MODEL_PATH)
#                 logging.info("Model loaded successfully.")
#             except FileNotFoundError:
#                 raise FileNotFoundError(
#                     f"Model file not found at: {MAIN_MODEL_PATH}. "
#                     "Please ensure the model file exists at the specified path."
#                 )
#             except Exception as e:
#                 logging.error(f"Error loading model: {e}")
#                 raise RuntimeError(f"Failed to load model: {e}")

#     def post(self, request):
#         serializer = ImageDiagnosisRequestSerializer(data=request.data)
#         if serializer.is_valid():
#             image_file = serializer.validated_data['image']

#             if not TENSORFLOW_AVAILABLE:
#                 return Response(
#                     {"error": TENSORFLOW_ERROR_MESSAGE},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )

#             try:
#                 self.load_model()

#                 img = PilImage.open(image_file).convert('RGB')
#                 img = img.resize((224, 224))
#                 img_array = image.img_to_array(img)
#                 img_array = np.expand_dims(img_array, axis=0) / 255.0

#                 predictions = self.model.predict(img_array)
#                 logging.debug(f"Model predictions: {predictions}")
#                 if len(predictions) == 0 or len(predictions[0]) == 0:
#                     raise ValueError("The model did not return any predictions.")

#                 predicted_class_index = np.argmax(predictions[0])
#                 confidence = predictions[0][predicted_class_index]

#                 if predicted_class_index >= len(CLASS_NAMES):
#                     raise IndexError(f"Predicted class index ({predicted_class_index}) is out of range for CLASS_NAMES.")

#                 predicted_class_name = CLASS_NAMES[predicted_class_index]

#                 result = {}
#                 if predicted_class_name == "healthy":
#                     result["status"] = "Healthy"
#                     result["disease_type"] = None
#                 elif predicted_class_name == "Not Olive Plant":
#                     result["status"] = "Not Olive Plant"
#                     result["disease_type"] = None
#                 else:
#                     result["status"] = "Infected"
#                     result["disease_type"] = predicted_class_name

#                 result["confidence"] = confidence.item()
#                 logging.info(f"Diagnosis result: {result}")

#                 # ✅ نحفظ التشخيص في قاعدة البيانات
#                 diagnosis = PlantDiagnose.objects.create(
#                     user=request.user,
#                     image_file=image_file,
#                     image_mongo_id="N/A",  # عدل هذا لاحقًا لو تستخدم Mongo
#                     diagnosis_result=result["status"] + (
#                         f": {result['disease_type']}" if result["disease_type"] else ""
#                     )
#                 )

#                 response_serializer = ImageDiagnosisResponseSerializer(data=result)
#                 if response_serializer.is_valid():
#                     return Response(response_serializer.data, status=status.HTTP_200_OK)
#                 else:
#                     return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             except Exception as e:
#                 logging.error(f"Error during prediction: {e}")
#                 return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def get(self, request, *args, **kwargs):
#         return Response(
#             {
#                 "error": "GET method is not allowed on this endpoint.",
#                 "message": "Please use a POST request with an image file to diagnose plant diseases.",
#                 "example": {
#                     "method": "POST",
#                     "url": "/api/diagnosis/",
#                     "headers": {"Content-Type": "multipart/form-data"},
#                     "body": {"image": "Upload your image file here"}
#                 }
#             },
#             status=status.HTTP_405_METHOD_NOT_ALLOWED
#         )
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from .serializers import PlantDiagnoseListSerializer



import os
import logging
import numpy as np
from PIL import Image as PilImage
from tensorflow.keras.preprocessing import image

from .models import PlantDiagnose
from .serializers import (
    ImageDiagnosisRequestSerializer,
    ImageDiagnosisResponseSerializer,
    PlantDiagnoseListSerializer
)

# إعداد السجل
logging.basicConfig(level=logging.DEBUG)

# تحميل النموذج
try:
    from tensorflow.keras.models import load_model
    TENSORFLOW_AVAILABLE = True
except ModuleNotFoundError as e:
    TENSORFLOW_AVAILABLE = False
    TENSORFLOW_ERROR_MESSAGE = (
        "TensorFlow غير مثبت أو غير متوافق مع البيئة. "
        "يمكنك تثبيته باستخدام الأمر: pip install tensorflow-cpu"
    )

MAIN_MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_model', 'file.h5')

CLASS_NAMES = [
    "Aculus Olearius", 
    "deficiencia",
    "healthy", 
    "knot disease", 
    "negrilla", 
    "Not Olive Plant",
    "olive peacock spot",
    "virosis",
]

# ✅ كلاس التشخيص بالصورة
class ImageDiagnosisAPIView(APIView):
    model = None

    def load_model(self):
        if self.model is None:
            try:
                logging.info(f"Attempting to load model from: {MAIN_MODEL_PATH}")
                self.model = load_model(MAIN_MODEL_PATH)
                logging.info("Model loaded successfully.")
            except FileNotFoundError:
                raise FileNotFoundError(
                    f"Model file not found at: {MAIN_MODEL_PATH}."
                )
            except Exception as e:
                logging.error(f"Error loading model: {e}")
                raise RuntimeError(f"Failed to load model: {e}")

    def post(self, request):
        serializer = ImageDiagnosisRequestSerializer(data=request.data)
        if serializer.is_valid():
            image_file = serializer.validated_data['image']

            if not TENSORFLOW_AVAILABLE:
                return Response({"error": TENSORFLOW_ERROR_MESSAGE}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                self.load_model()

                img = PilImage.open(image_file).convert('RGB')
                img = img.resize((224, 224))
                img_array = image.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0) / 255.0

                predictions = self.model.predict(img_array)
                predicted_class_index = np.argmax(predictions[0])
                confidence = predictions[0][predicted_class_index]

                predicted_class_name = CLASS_NAMES[predicted_class_index]

                result = {}
                if predicted_class_name == "healthy":
                    result["status"] = "Healthy"
                    result["disease_type"] = None
                elif predicted_class_name == "Not Olive Plant":
                    result["status"] = "Not Olive Plant"
                    result["disease_type"] = None
                else:
                    result["status"] = "Infected"
                    result["disease_type"] = predicted_class_name

                result["confidence"] = confidence.item()

                # حفظ التشخيص
                diagnosis = PlantDiagnose.objects.create(
                    user=request.user,
                    image_file=image_file,
                    image_mongo_id="N/A",  # عدلها حسب استخدامك لـ Mongo
                    diagnosis_result=result["status"] + (
                        f": {result['disease_type']}" if result["disease_type"] else ""

                    ),
                        confidence_score=confidence.item()  # ✅ أضف هذا

                )

                response_serializer = ImageDiagnosisResponseSerializer(data=result)
                if response_serializer.is_valid():
                    return Response(response_serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except Exception as e:
                logging.error(f"Error during prediction: {e}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        return Response(
            {
                "error": "GET method is not allowed on this endpoint.",
                "message": "Use POST with an image file.",
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

# دالة عرض تشخيصات المستخدم


class DiagnosisListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """جلب تشخيصات المستخدم مع فلترة وترقيم وبحث"""
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 10)
        status_filter = request.GET.get('status', None)
        search = request.GET.get('search', None)

        queryset = PlantDiagnose.objects.filter(user=request.user)

        if status_filter:
            queryset = queryset.filter(diagnosis_status=status_filter)

        if search:
            queryset = queryset.filter(plant_name__icontains=search)

        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        serializer = PlantDiagnoseListSerializer(
            page_obj.object_list,
            many=True,
            context={'request': request}
        )

        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': int(page),
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        })
    

