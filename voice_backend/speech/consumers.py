# import json
#import whisper
# import tempfile
# import os
# import traceback
# import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

#model = whisper.load_model("base")


class AudioConsumer(AsyncWebsocketConsumer):

    # async def connect(self):
    #     print("✅ WebSocket Connected")
    #     await self.accept()

    #     self.previous_text = ""

    #     # 🔥 Keep first chunk as base (IMPORTANT)
    #     self.header_chunk = None
    #     self.audio_chunks = []

    # async def disconnect(self, close_code):
    #     print("🔌 WebSocket Disconnected")

    # async def receive(self, bytes_data=None, text_data=None):
    #     print("📡 receive() triggered")
    #     if bytes_data:
    #         try:
    #             print("🎤 Received:", len(bytes_data), "bytes")

    #             # 🔥 Store first chunk as header
    #             if self.header_chunk is None:
    #                 self.header_chunk = bytes_data
    #                 print("🧠 Header chunk saved")
    #                 return

    #             # 🔥 Store chunks
    #             self.audio_chunks.append(bytes_data)

    #             # 🔥 Process after 3 chunks (~3 sec)
    #             if len(self.audio_chunks) < 3:
    #                 return

    #             # 🔥 Build VALID WebM file
    #             full_audio = self.header_chunk + b"".join(self.audio_chunks)

    #             with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
    #                 tmp.write(full_audio)
    #                 tmp_path = tmp.name

    #             print("📁 Saved:", tmp_path)

    #             # 🔥 Run Whisper async
    #             loop = asyncio.get_event_loop()
    #             result = await loop.run_in_executor(
    #                 None,
    #                 lambda: model.transcribe(tmp_path, language="en")
    #             )

    #             current_text = result.get("text", "").strip()
    #             print("📝 RAW:", current_text)

    #             # 🔥 Remove duplicates
    #             new_text = self.get_new_text(self.previous_text, current_text)
    #             self.previous_text = current_text

    #             os.remove(tmp_path)

    #             # 🔥 Reset only chunks (KEEP HEADER)
    #             self.audio_chunks = []

    #             if new_text:
    #                 print("✅ NEW:", new_text)

    #                 await self.send(text_data=json.dumps({
    #                     "text": new_text
    #                 }))

    #         except Exception as e:
    #             print("❌ ERROR:", str(e))
    #             print(traceback.format_exc())

    #             await self.send(text_data=json.dumps({
    #                 "error": str(e)
    #             }))

    # 🔥 Duplicate removal
    # def get_new_text(self, old, new):
    #     if not old:
    #         return new

    #     if new.startswith(old):
    #         return new[len(old):].strip()

    #     old_words = old.split()
    #     new_words = new.split()

    #     i = 0
    #     while i < min(len(old_words), len(new_words)):
    #         if old_words[i] != new_words[i]:
    #             break
    #         i += 1

    #     return " ".join(new_words[i:])