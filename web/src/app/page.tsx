"use client"

import React, { useState, useRef, useEffect } from "react"
import { ArrowUp, Plus, Settings, User, Bot, Trash2, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

const styles = `
  *:focus-visible { outline-offset: 0 !important; }
  textarea::-webkit-scrollbar { width: 4px; }
  textarea::-webkit-scrollbar-track { background: transparent; }
  textarea::-webkit-scrollbar-thumb { background-color: #555; border-radius: 2px; }
`

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea className={cn("flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none", className)} ref={ref} {...props} />
  )
)
Textarea.displayName = "Textarea"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
}

const MODELS = [
  { id: "gpt-3.5", name: "GPT-3.5" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-3", name: "Claude 3" },
  { id: "llama-3", name: "Llama 3" },
  { id: "mixtral", name: "Mixtral" },
]

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([{ id: "1", title: "New Chat", messages: [{ id: "welcome", role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }] }])
  const [currentChatId, setCurrentChatId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0]
  const messages = currentChat.messages

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
    return () => { try { document.head.removeChild(styleSheet) } catch {} } }
  }, [])

  const createNewChat = () => {
    const newChat: Chat = { id: Date.now().toString(), title: "New Chat", messages: [{ id: Date.now().toString(), role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }] }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const deleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    const newChats = chats.filter(c => c.id !== chatId)
    setChats(newChats)
    if (currentChatId === chatId && newChats.length > 0) setCurrentChatId(newChats[0].id)
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() }
    
    const updatedChats = chats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...chat.messages, userMessage], title: chat.messages.length === 1 && chat.title === "New Chat" ? input.slice(0, 30) + "..." : chat.title }
        : chat
    )
    setChats(updatedChats)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMessage.content, model: selectedModel }) })
      const data = await response.json()
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.response, timestamp: new Date() }
      setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat))

      if (voiceEnabled && data.response) {
        const utterance = new SpeechSynthesisUtterance(data.response)
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong.", timestamp: new Date() }] } : chat))
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }

  const hasContent = input.trim() !== ""

  return (
    <div className="flex h-screen bg-[#343541]">
      {/* Sidebar */}
      <div className="w-64 bg-[#202123] flex flex-col">
        <div className="p-3">
          <button onClick={createNewChat} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-[#5436da] hover:bg-[#6436eb] text-white font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs text-gray-500 uppercase px-2 py-2">Recent</div>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setCurrentChatId(chat.id)} className={cn("group flex items-center justify-between w-full p-2.5 rounded-lg text-sm text-gray-200 cursor-pointer mb-1", currentChatId === chat.id ? "bg-[#343541]" : "hover:bg-[#343541]/50")}>
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <button onClick={(e) => deleteChat(e, chat.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#343541]">
          <div className="flex items-center gap-2 p-2 text-gray-300 text-sm hover:bg-[#343541] rounded-lg cursor-pointer">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-transparent text-white text-sm font-medium cursor-pointer focus:outline-none">
              {MODELS.map(m => <option key={m.id} value={m.id} className="bg-[#202123]">{m.name}</option>)}
            </select>
          </div>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", voiceEnabled ? "bg-green-600/20 text-green-400" : "text-gray-400")}>
            {voiceEnabled ? "🔊 Voice On" : "🔇"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(message => (
              <motion.div key={message.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", message.role === "user" ? "bg-green-600" : "bg-[#5436da]")}>
                  {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={cn("flex-1 px-4 py-3 rounded-lg text-sm", message.role === "user" ? "bg-[#5436da]" : "bg-[#343541]")}>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5436da] flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                <div className="flex items-center gap-1 pt-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="max-w-3xl mx-auto">
            <div className={cn("rounded-xl border border-[#4a4a4a] bg-[#40414e] p-1", isLoading && "border-red-500/50")}>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Send a message..." className="text-base max-h-40" disabled={isLoading} />
              <div className="flex justify-end px-2 pb-1">
                <button onClick={handleSubmit} disabled={!hasContent || isLoading} className={cn("p-1.5 rounded-lg transition-colors", hasContent ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 opacity-50")}>
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">{selectedModel} model • AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}