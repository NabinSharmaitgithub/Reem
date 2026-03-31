#!/usr/bin/env python3
"""
Reem - Friendly Voice AI Assistant
CLI version (no GUI required)
"""

import sys
import logging
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from modules.voice_input import VoiceInput
from modules.wake_word import WakeWordDetector
from modules.ai_brain import AIBrain
from modules.tts import TextToSpeech

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ReemCLI:
    def __init__(self):
        self.voice_input = VoiceInput()
        self.wake_detector = WakeWordDetector()
        self.ai_brain = AIBrain()
        self.tts = TextToSpeech()
        self.running = False

    def print_status(self, status):
        print(f"\n[{status}]")

    def start(self):
        self.running = True
        print("\n" + "="*50)
        print("  Reem AI Assistant - CLI Mode")
        print("="*50)
        print("\nSay 'Hey Reem' to activate...")
        print("Or type your message and press Enter")
        print("Type 'quit' to exit\n")
        
        self._continuous_listening()

    def stop(self):
        self.running = False
        print("\nReem stopped. Goodbye!")

    def _continuous_listening(self):
        while self.running:
            try:
                self.print_status("Listening for 'Hey Reem'...")
                
                if self.wake_detector.listen_for_wake_word(timeout=3):
                    print("\n>> Wake word detected! Listening for command...")
                    
                    command = self.voice_input.listen_and_recognize(
                        timeout=settings.LISTEN_TIMEOUT,
                        phrase_time_limit=settings.LISTEN_PHRASE_TIME_LIMIT
                    )
                    
                    if command:
                        print(f"\nYou: {command}")
                        self.process_command(command)
                    else:
                        print("\nNo command detected.")
                        
            except KeyboardInterrupt:
                self.stop()
                break
            except Exception as e:
                logger.error(f"Error: {e}")
                continue

    def process_command(self, command):
        print("Thinking...")
        response = self.ai_brain.get_response(command)
        print(f"\nReem: {response}\n")
        self.tts.speak(response)

    def run_text_mode(self):
        print("\n" + "="*50)
        print("  Reem AI Assistant - Text Mode")
        print("="*50)
        print("Type your message and press Enter")
        print("Type 'quit' to exit\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("\nGoodbye!")
                    break
                self.process_command(user_input)
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                logger.error(f"Error: {e}")


def main():
    cli = ReemCLI()
    
    mode = input("Choose mode:\n1. Voice (listen for 'Hey Reem')\n2. Text (type messages)\n\nEnter 1 or 2: ").strip()
    
    if mode == "1":
        try:
            cli.start()
        except KeyboardInterrupt:
            cli.stop()
    else:
        cli.run_text_mode()


if __name__ == "__main__":
    main()