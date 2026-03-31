import speech_recognition as sr
import logging
from config import settings

logger = logging.getLogger(__name__)

class WakeWordDetector:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 400
        self.wake_word = settings.WAKE_WORD.lower()
        self.wake_phrases = [p.lower() for p in settings.WAKE_PHRASES]
        
    def listen_for_wake_word(self, timeout=None):
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            try:
                audio = self.recognizer.listen(
                    source,
                    timeout=timeout,
                    phrase_time_limit=5
                )
                text = self.recognizer.recognize_google(audio).lower()
                return self._check_wake_word(text)
            except sr.WaitTimeoutError:
                return False
            except sr.UnknownValueError:
                return False
            except Exception as e:
                logger.error(f"Wake word detection error: {e}")
                return False
    
    def _check_wake_word(self, text):
        for phrase in self.wake_phrases:
            if phrase in text:
                return True
        return False
    
    def detect_from_audio(self, audio):
        try:
            text = self.recognizer.recognize_google(audio).lower()
            return self._check_wake_word(text)
        except:
            return False