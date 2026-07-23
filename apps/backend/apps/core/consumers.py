# apps/backend/core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LiveTransactionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Add to a broadcast group if needed
        await self.channel_layer.group_add("live_transactions", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("live_transactions", self.channel_name)

    async def receive(self, text_data):
        # Handle incoming client messages if required
        pass

    async def send_transaction(self, event):
        # Broadcast transaction payload down to frontend client
        await self.send(text_data=json.dumps(event))