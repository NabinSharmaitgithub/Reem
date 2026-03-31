#!/usr/bin/env python3
"""
Reem - Friendly Voice AI Assistant
Main entry point
"""

import threading
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from modules.voice_input import VoiceInput
from modules.wake_word import WakeWordDetector
from modules.ai_brain import AIBrain
from modules.tts import TextToSpeech
from modules.gui import ReemGUI

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ReemAssistant:
    def __init__(self):
        self.gui = ReemGUI(settings.GUI_WIDTH, settings.GUI_HEIGHT)
        self.voice_input = VoiceInput()
        self.wake_detector = WakeWordDetector()
        self.ai_brain = AIBrain()
        self.tts = TextToSpeech()
        
        self.running = False
        self.listen_thread = None
        
    def start(self):
        self.running = True
        self.gui.running = True
        
        self.listen_thread = threading.Thread(target=self._continuous_listening, daemon=True)
        self.listen_thread.start()
        
        logger.info("Reem assistant started")
        
    def stop(self):
        self.running = False
        self.gui.running = False
        logger.info("Reem assistant stopped")
        
    def _continuous_listening(self):
        while self.running:
            if not self.gui.running:
                break
                
            try:
                self.gui.update_status("listening", "🟡 Listening for 'Hey Reem'...")
                
                if self.wake_detector.listen_for_wake_word(timeout=3):
                    self.gui.update_status("processing", "🟢 Processing...")
                    self.gui.add_message("system", "Wake word detected! Listening for command...")
                    
                    command = self.voice_input.listen_and_recognize(
                        timeout=settings.LISTEN_TIMEOUT,
                        phrase_time_limit=settings.LISTEN_PHRASE_TIME_LIMIT
                    )
                    
                    if command:
                        self.gui.add_message("user", command)
                        self.gui.update_status("processing", "🔵 Thinking...")
                        
                        response = self.ai_brain.get_response(command)
                        
                        self.gui.add_message("reem", response)
                        self.gui.update_status("speaking", "🔊 Speaking...")
                        
                        self.tts.set_voice_gender(self.gui.voice_gender)
                        self.tts.speak_async(response)
                        
                        self.gui.update_status("listening", "🟡 Listening...")
                    else:
                        self.gui.add_message("system", "No command detected. Continuing...")
                        
            except Exception as e:
                logger.error(f"Error in continuous listening: {e}")
                self.gui.update_status("listening", "🟡 Listening...")
                
    def handle_text_input(self):
        message = self.gui.send_text_message()
        if message:
            self.gui.add_message("user", message)
            self.gui.update_status("processing", "🔵 Thinking...")
            
            response = self.ai_brain.get_response(message)
            
            self.gui.add_message("reem", response)
            self.gui.update_status("speaking", "🔊 Speaking...")
            
            self.tts.set_voice_gender(self.gui.voice_gender)
            self.tts.speak_async(response)
            
            self.gui.update_status("listening", "🟡 Listening...")


def main():
    assistant = ReemAssistant()
    
    assistant.gui.start_button.config(command=assistant.start)
    assistant.gui.stop_button.config(command=assistant.stop)
    
    original_send = assistant.gui.send_text_message
    def wrapped_send(event=None):
        msg = original_send(event)
        if msg:
            assistant.gui.add_message("user", msg)
            assistant.gui.update_status("processing", "🔵 Thinking...")
            response = assistant.ai_brain.get_response(msg)
            assistant.gui.add_message("reem", response)
            assistant.tts.set_voice_gender(assistant.gui.voice_gender)
            assistant.tts.speak_async(response)
            assistant.gui.update_status("listening", "🟡 Listening...")
        return "break"
    
    assistant.gui.text_input.bind("<Return>", wrapped_send)
    
    assistant.gui.start_button.config(command=assistant.start)
    assistant.gui.stop_button.config(command=assistant.stop)
    
    assistant.gui.root.mainloop()


if __name__ == "__main__":
    main()