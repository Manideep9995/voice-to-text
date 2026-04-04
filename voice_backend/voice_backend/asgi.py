import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack  # ✅ ADD THIS
from django.core.asgi import get_asgi_application
from django.urls import path
from speech.consumers import AudioConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voice_backend.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": AuthMiddlewareStack(   # 🔥 WRAP HERE
        URLRouter([
            path("ws/audio/", AudioConsumer.as_asgi()),
        ])
    ),
})