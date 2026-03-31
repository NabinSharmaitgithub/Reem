"use client"

import React, { useState, useRef, useEffect } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { ArrowUp, Square, Mic, ChevronDown, Check, Plus, Trash2, MessageSquare, Settings, User, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

const styles = `
  *:focus-visible { outline-offset: 0 !important; --ring-offset: 0 !important; }
  textarea::-webkit-scrollbar { width: 6px; }
  textarea::-webkit-scrollbar-track { background: transparent; }
  textarea::-webkit-scrollbar-thumb { background-color: #4a4a4a; border-radius: 3px; }
  textarea::-webkit-scrollbar-thumb:hover { background-color: #5a5a5a; }
`

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn("flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none", className)}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md border border-[#4a4a4a] bg-[#202123] px-3 py-1.5 text-sm text-white shadow-md", className)} {...props} />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  model: string
}

const MODELS = [
  { id: "gpt-3.5", name: "GPT-3.5", provider: "OpenAI" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "llama-3", name: "Llama 3", provider: "Meta" },
  { id: "mixtral", name: "Mixtral", provider: "Mistral" },
]

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([{ id: "1", title: "New Chat", messages: [{ id: "welcome", role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }], model: "gpt-3.5" }])
  const [currentChatId, setCurrentChatId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5")
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0]
  const messages = currentChat.messages

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
    return () => { try { document.head.removeChild(styleSheet) } catch {} }
  }, [])

  const currentModel = MODELS.find(m => m.id === selectedModel)

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [{ id: Date.now().toString(), role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }],
      model: selectedModel
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    const newChats = chats.filter(c => c.id !== chatId)
    setChats(newChats)
    if (currentChatId === chatId && newChats.length > 0) {
      setCurrentChatId(newChats[0].id)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() }
    
    const updatedChats = chats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...chat.messages, userMessage], title: chat.messages.length === 1 && chat.title === "New Chat" ? input.slice(0, 30) : chat.title }
        : chat
    )
    setChats(updatedChats)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, model: selectedModel }),
      })

      const data = await response.json()
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.response, timestamp: new Date(), model: data.model }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const hasContent = input.trim() !== ""

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#343541]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }} 
              animate={{ width: 260, opacity: 1 }} 
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col bg-[#202123] border-r border-[#4a4a4a]"
            >
              <div className="p-3">
                <button onClick={createNewChat} className="flex items-center gap-2 w-full p-3 rounded-lg bg-[#343541] hover:bg-[#404040] text-white font-medium transition-colors">
                  <Plus className="w-5 h-5" />
                  New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2">
                <div className="text-xs text-gray-500 px-3 py-2">Recent</div>
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setCurrentChatId(chat.id)}
                    className={cn("flex items-center gap-2 w-full p-3 rounded-lg text-left text-sm transition-colors mb-1", currentChatId === chat.id ? "bg-[#343541] text-white" : "text-gray-300 hover:bg-[#343541]/50")}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1">{chat.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }} className="opacity-0 group-hover:opacity-100 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-[#4a4a4a]">
                <div className="flex items-center gap-2 p-2 text-gray-300 text-sm hover:bg-[#343541] rounded-lg cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#343541] border-b border-[#4a4a4a]">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-400 hover:text-white">
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202123] border border-[#4a4a4a] hover:border-[#6b6b6b] text-sm text-white"
                >
                  <span>{currentModel?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showModelDropdown && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 mt-2 w-56 bg-[#202123] border border-[#4a4a4a] rounded-lg shadow-xl z-50 overflow-hidden">
                    {MODELS.map((model) => (
                      <button key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false) }} className={cn("w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-[#343541]", selectedModel === model.id ? "text-green-400" : "text-white")}>
                        <div><div className="font-medium">{model.name}</div><div className="text-xs text-gray-500">{model.provider}</div></div>
                        {selectedModel === model.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", voiceEnabled ? "bg-green-600/20 text-green-400 border border-green-600/50" : "text-gray-400")}>
                {voiceEnabled ? "🔊 Voice On" : "🔇"}
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-4 max-w-3xl mx-auto", message.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", message.role === "user" ? "bg-green-600" : "bg-[#5436da]")}>
                  {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={cn("flex-1 px-4 py-2 rounded-lg", message.role === "user" ? "bg-[#5436da]" : "bg-[#343541]")}>
                  <p className="text-white whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-[#5436da] flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-[#343541]">
            <div className="max-w-3xl mx-auto">
              <div className={cn("rounded-xl border border-[#4a4a4a] bg-[#202123] p-2 transition-all", isLoading && "border-red-500/50")}>
                <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Send a message..." className="text-base max-h-48" disabled={isLoading} />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">{selectedModel} model</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => hasContent && handleSubmit()} disabled={!hasContent || isLoading} className={cn("p-2 rounded-lg transition-colors", hasContent ? "bg-green-600 hover:bg-green-700" : "bg-gray-600")}>
                        <ArrowUp className="w-4 h-4 text-white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Send</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </div>
      {showModelDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />}
    </TooltipProvider>
  )
}