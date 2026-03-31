import speech_recognition as sr
import logging

logger = logging.getLogger(__name__)

class VoiceInput:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.pause_threshold = 0.8
        
    def get_microphone(self):
        try:
            return sr.Microphone()
        except OSError as e:
            logger.error(f"No microphone found: {e}")
            return None
    
    def listen(self, timeout=None, phrase_time_limit=None):
        with self.get_microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            try:
                audio = self.recognizer.listen(
                    source,
                    timeout=timeout,
                    phrase_time_limit=phrase_time_limit
                )
                return audio
            except sr.WaitTimeoutError:
                return None
            except Exception as e:
                logger.error(f"Listen error: {e}")
                return None
    
    def recognize_speech(self, audio):
        try:
            text = self.recognizer.recognize_google(audio)
            return text.lower()
        except sr.UnknownValueError:
            return None
        except sr.RequestError as e:
            logger.error(f"Speech recognition API error: {e}")
            return None
    
    def listen_and_recognize(self, timeout=None, phrase_time_limit=None):
        audio = self.listen(timeout, phrase_time_limit)
        if audio:
            return self.recognize_speech(audio)
        return None