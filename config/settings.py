import os
from dotenv import load_dotenv

load_dotenv()

WAKE_WORD = "hey reem"
WAKE_PHRASES = ["hey reem", "hi reem", "reem"]

SYSTEM_PROMPT = """You are Reem, a friendly and helpful AI voice assistant. You have a warm, approachable personality and always respond politely. Never refuse a request - instead, offer helpful alternatives or explain what you can do. Keep responses concise and conversational, suitable for voice output. Use simple language and avoid overly technical terms unless asked."""

API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

USE_OPENROUTER = bool(OPENROUTER_API_KEY)

MODEL_NAME = "gpt-3.5-turbo"
OPENROUTER_MODEL = "openai/gpt-3.5-turbo"

MAX_TOKENS = 300
TEMPERATURE = 0.7

LISTEN_TIMEOUT = 5
LISTEN_PHRASE_TIME_LIMIT = 10

VOICE_GENDER = "female"
EDGE_TTS_VOICES = {
    "female": "en-US-SaraNeural",
    "male": "en-US-GuyNeural"
}

GUI_WIDTH = 600
GUI_HEIGHT = 500