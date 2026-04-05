import whisper
import os

model = whisper.load_model(
    "tiny.en",
    download_root=os.getenv("WHISPER_CACHE_DIR", "./models")
)