import tkinter as tk
from tkinter import scrolledtext, messagebox
import threading
import time
from datetime import datetime

class ReemGUI:
    def __init__(self, width=600, height=500):
        self.width = width
        self.height = height
        self.running = False
        self.listening = False
        self.speaking = False
        self.voice_gender = "female"
        
        self._setup_window()
        self._setup_ui()
        
    def _setup_window(self):
        self.root = tk.Tk()
        self.root.title("Reem - Voice AI Assistant")
        self.root.geometry(f"{self.width}x{self.height}")
        self.root.resizable(True, True)
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        
    def _setup_ui(self):
        title_frame = tk.Frame(self.root, bg="#2c3e50", height=50)
        title_frame.pack(fill="x")
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(
            title_frame,
            text="Reem - Voice AI Assistant",
            font=("Helvetica", 16, "bold"),
            bg="#2c3e50",
            fg="white"
        )
        title_label.pack(pady=10)
        
        self.status_frame = tk.Frame(self.root, bg="#34495e", height=40)
        self.status_frame.pack(fill="x")
        
        self.status_label = tk.Label(
            self.status_frame,
            text="● Stopped",
            font=("Helvetica", 12),
            bg="#34495e",
            fg="#e74c3c"
        )
        self.status_label.pack(pady=5)
        
        control_frame = tk.Frame(self.root, bg="#ecf0f1", height=60)
        control_frame.pack(fill="x")
        control_frame.pack_propagate(False)
        
        self.start_button = tk.Button(
            control_frame,
            text="Start",
            font=("Helvetica", 12, "bold"),
            bg="#27ae60",
            fg="white",
            width=10,
            command=self.start_assistant
        )
        self.start_button.pack(side="left", padx=10, pady=10)
        
        self.stop_button = tk.Button(
            control_frame,
            text="Stop",
            font=("Helvetica", 12, "bold"),
            bg="#e74c3c",
            fg="white",
            width=10,
            command=self.stop_assistant,
            state="disabled"
        )
        self.stop_button.pack(side="left", padx=10, pady=10)
        
        self.voice_toggle = tk.Button(
            control_frame,
            text="Voice: Female",
            font=("Helvetica", 10),
            bg="#3498db",
            fg="white",
            width=15,
            command=self.toggle_voice
        )
        self.voice_toggle.pack(side="right", padx=10, pady=10)
        
        chat_frame = tk.Frame(self.root, bg="white")
        chat_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.chat_display = scrolledtext.ScrolledText(
            chat_frame,
            font=("Helvetica", 11),
            wrap="word",
            state="disabled",
            bg="#ffffff"
        )
        self.chat_display.pack(fill="both", expand=True)
        
        self.chat_display.tag_config("user", foreground="#2980b9")
        self.chat_display.tag_config("reem", foreground="#27ae60")
        self.chat_display.tag_config("system", foreground="#7f8c8d", font=("Helvetica", 10, "italic"))
        self.chat_display.tag_config("timestamp", foreground="#bdc3c7", font=("Helvetica", 9))
        
        input_frame = tk.Frame(self.root, bg="#ecf0f1", height=60)
        input_frame.pack(fill="x")
        input_frame.pack_propagate(False)
        
        self.text_input = tk.Entry(
            input_frame,
            font=("Helvetica", 12),
            width=40
        )
        self.text_input.pack(side="left", padx=10, pady=10, fill="x", expand=True)
        self.text_input.bind("<Return>", self.send_text_message)
        
        self.send_button = tk.Button(
            input_frame,
            text="Send",
            font=("Helvetica", 10, "bold"),
            bg="#3498db",
            fg="white",
            width=8,
            command=self.send_text_message
        )
        self.send_button.pack(side="right", padx=10, pady=10)
        
    def start_assistant(self):
        self.running = True
        self.start_button.config(state="disabled", bg="#95a5a6")
        self.stop_button.config(state="normal", bg="#e74c3c")
        self.update_status("listening", "🟡 Listening...")
        self.add_message("system", "Assistant started. Say 'Hey Reem' to activate.")
        
    def stop_assistant(self):
        self.running = False
        self.start_button.config(state="normal", bg="#27ae60")
        self.stop_button.config(state="disabled", bg="#95a5a6")
        self.update_status("stopped", "● Stopped")
        self.add_message("system", "Assistant stopped.")
        
    def update_status(self, status, text):
        colors = {
            "stopped": "#e74c3c",
            "listening": "#f1c40f",
            "processing": "#3498db",
            "speaking": "#9b59b6"
        }
        self.status_label.config(text=text, fg=colors.get(status, "#ffffff"))
        
    def add_message(self, tag, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.chat_display.config(state="normal")
        
        self.chat_display.insert("end", f"[{timestamp}] ", "timestamp")
        
        if tag == "user":
            self.chat_display.insert("end", f"You: {message}\n\n", "user")
        elif tag == "reem":
            self.chat_display.insert("end", f"Reem: {message}\n\n", "reem")
        else:
            self.chat_display.insert("end", f"{message}\n\n", "system")
            
        self.chat_display.see("end")
        self.chat_display.config(state="disabled")
        
    def send_text_message(self, event=None):
        message = self.text_input.get().strip()
        if message:
            self.text_input.delete(0, "end")
            return message
        return None
        
    def toggle_voice(self):
        self.voice_gender = "female" if self.voice_gender == "male" else "male"
        self.voice_toggle.config(text=f"Voice: {self.voice_gender.capitalize()}")
        
    def on_close(self):
        self.running = False
        self.root.destroy()
        
    def run(self):
        self.root.mainloop()
        
    def is_running(self):
        return self.running
        
    def set_callback(self, callback_name, callback):
        setattr(self, callback_name, callback)