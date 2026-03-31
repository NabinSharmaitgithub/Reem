import openai
import logging
import requests
from config import settings

logger = logging.getLogger(__name__)

class AIBrain:
    def __init__(self):
        self.use_openrouter = settings.USE_OPENROUTER
        self.api_key = settings.OPENROUTER_API_KEY or settings.API_KEY
        self.model = settings.OPENROUTER_MODEL if self.use_openrouter else settings.MODEL_NAME
        self.max_tokens = settings.MAX_TOKENS
        self.temperature = settings.TEMPERATURE
        self.conversation_history = []
        
    def add_message(self, role, content):
        self.conversation_history.append({"role": role, "content": content})
        
    def get_response(self, user_message):
        if not self.api_key:
            return "I need an API key to think. Please set your OpenRouter or OpenAI API key in the .env file."
        
        self.add_message("user", user_message)
        
        messages = [{"role": "system", "content": settings.SYSTEM_PROMPT}]
        messages.extend(self.conversation_history[-10:])
        
        try:
            if self.use_openrouter:
                return self._openrouter_request(messages)
            else:
                return self._openai_request(messages)
        except Exception as e:
            logger.error(f"API error: {e}")
            return "I'm having some trouble thinking right now. Let's try again."
    
    def _openai_request(self, messages):
        openai.api_key = settings.API_KEY
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature
        )
        assistant_message = response.choices[0].message.content
        self.add_message("assistant", assistant_message)
        return assistant_message
    
    def _openrouter_request(self, messages):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://reem-ai.local",
            "X-Title": "Reem AI Assistant"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter error: {response.status_code}")
        
        result = response.json()
        assistant_message = result["choices"][0]["message"]["content"]
        self.add_message("assistant", assistant_message)
        return assistant_message
    
    def clear_history(self):
        self.conversation_history = []