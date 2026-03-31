import os
import subprocess
import threading
import logging
from gtts import gTTS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextToSpeech:
    def __init__(self):
        self._has_audio = self._check_audio()
        
    def _check_audio(self):
        for player in ["ffplay", "aplay", "mpg123"]:
            if subprocess.run(["which", player], capture_output=True).returncode == 0:
                return True
        return False
    
    def speak(self, text):
        try:
            tts = gTTS(text=text, lang='en')
            temp_file = "/tmp/reem.mp3"
            tts.save(temp_file)
            
            if self._has_audio:
                subprocess.Popen(
                    ["ffplay", "-nodisp", "-autoexit", temp_file],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
            
            os.remove(temp_file)
        except Exception as e:
            logger.error(f"TTS error: {e}")
        
        print(f"\n🔊 Reem: {text}\n")
        
    def speak_async(self, text):
        threading.Thread(target=self.speak, args=(text,)).start()