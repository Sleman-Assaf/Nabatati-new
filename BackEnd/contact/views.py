from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ContactMessageSerializer

class ContactMessageAPIView(APIView):
   def post(self, request):
    print("📨 Received:", request.data)
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print("✅ Saved")
        return Response({'message': 'Saved'}, status=201)
    else:
        print("❌ Invalid:", serializer.errors)
        return Response(serializer.errors, status=400)