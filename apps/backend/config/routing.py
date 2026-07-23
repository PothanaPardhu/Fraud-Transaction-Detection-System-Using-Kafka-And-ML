# apps/backend/config/routing.py
from django.urls import re_path
from core.consumers import LiveTransactionConsumer

websocket_urlpatterns = [
    re_path(r"^ws/live-transactions/$", LiveTransactionConsumer.as_asgi()),
]