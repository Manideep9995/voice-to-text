import os
import traceback
#import whisper
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .model import model
# Load model once
#model = whisper.load_model("base")
#model = whisper.load_model("tiny")
@api_view(['POST'])
def transcribe_audio(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file provided"}, status=400)

    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    file_path = os.path.join(settings.MEDIA_ROOT, file.name)

    try:
        # Save file
        with open(file_path, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Convert speech → text
        result = model.transcribe(file_path)
        text = result.get("text", "")

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    return Response({"text": text})