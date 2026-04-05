from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import QuestionSerializer
import langdetect
import google.generativeai as genai

API_KEY = "AIzaSyDujYwOoHspI_6A6wv_Wul4OL8Wf4kvS9s"  # ⚠️ لا تنس تنقله إلى settings.py لاحقًا

genai.configure(api_key=API_KEY)

class AskGeminiAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = QuestionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        question = serializer.validated_data['question']

        if "زيتون" not in question and "olive" not in question.lower():
            return Response(
                {"response": "هذه الصفحة متخصصة في أمراض شجر الزيتون فقط."},
                status=status.HTTP_200_OK
            )

        try:
            language = langdetect.detect(question)
        except:
            language = 'en'

        if language == 'ar':
            prompt = f"أجب فقط عن أمراض شجر الزيتون المتعلقة بالسؤال التالي، ولا تتحدث عن أي شيء آخر:\n{question}"
        else:
            prompt = f"Only answer about diseases of olive trees related to the following question. Do not mention anything unrelated:\n{question}"

        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            answer = response.text
            return Response({"response": answer}, status=status.HTTP_200_OK)

        except Exception as e:
           print("❌ Gemini Error:", e)  # هذا يظهر الخطأ في الكونسول
           return Response({"error": f"Gemini Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # except Exception as e:
        #  return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

