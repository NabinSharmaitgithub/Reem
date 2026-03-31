"use client"

import React, { useState, useRef, useEffect } from "react"
import { ArrowUp, Plus, Settings, User, Bot, Trash2, MessageSquare, ChevronDown } from "lucide-react"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background-color: #555; border-radius: 3px; }
`

interface Model { id: string; name: string; provider: string; free?: boolean }
interface Message { id: string; role: "user" | "assistant"; content: string; timestamp: Date }
interface Chat { id: string; title: string; messages: Message[] }

const DEFAULT_MODEL = "llama-3.1-8b"

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([{ id: "1", title: "New Chat", messages: [{ id: "welcome", role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }] }])
  const [currentChatId, setCurrentChatId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const models: Model[] = [
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", provider: "Meta", free: true },
    { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", free: true },
    { id: "llama-3-70b", name: "Llama 3 70B", provider: "Meta", free: true },
    { id: "llama-3-8b", name: "Llama 3 8B", provider: "Meta", free: true },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", provider: "Mistral", free: true },
    { id: "mixtral-8x22b", name: "Mixtral 8x22B", provider: "Mistral", free: true },
    { id: "phi-3.5", name: "Phi 3.5 Mini", provider: "Microsoft", free: true },
    { id: "qwen-2.5", name: "Qwen 2.5 7B", provider: "Alibaba", free: true },
    { id: "gemma-2-9b", name: "Gemma 2 9B", provider: "Google", free: true },
    { id: "deepseek-v2.5", name: "DeepSeek V2.5", provider: "DeepSeek", free: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  ]

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0]
  const messages = currentChat.messages
  const currentModel = models.find(m => m.id === selectedModel) || models[0]
  const freeModels = models.filter(m => m.free)
  const paidModels = models.filter(m => !m.free)

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
    const updatedChats = chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, userMessage], title: chat.messages.length === 1 && chat.title === "New Chat" ? input.slice(0, 30) + "..." : chat.title } : chat)
    setChats(updatedChats)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMessage.content, model: selectedModel }) })
      const data = await response.json()
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.response, timestamp: new Date() }
      setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat))
      if (voiceEnabled && data.response) { speechSynthesis.speak(new SpeechSynthesisUtterance(data.response)) }
    } catch (error) {
      setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong.", timestamp: new Date() }] } : chat))
    }
    setIsLoading(false)
  }

  const hasContent = input.trim() !== ""

  const sidebarStyle: React.CSSProperties = { width: 260, backgroundColor: "#202123", display: "flex", flexDirection: "column", height: "100vh" }
  const mainStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#343541", height: "100vh" }
  const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2e2e2e" }
  const messagesStyle: React.CSSProperties = { flex: 1, overflowY: "auto", padding: 16 }
  const inputContainerStyle: React.CSSProperties = { maxWidth: 768, margin: "0 auto", width: "100%", padding: "0 16px 16px" }
  const inputStyle: React.CSSProperties = { borderRadius: 12, border: "1px solid #4a4a4a", backgroundColor: "#40414e", padding: 12, color: "white", fontSize: 15, width: "100%", resize: "none" as const, outline: "none", fontFamily: "inherit" }
  const messageContainerStyle: React.CSSProperties = { maxWidth: 768, margin: "0 auto", display: "flex", gap: 12, marginBottom: 16 }
  const avatarStyle: React.CSSProperties = { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
  const userAvatarStyle: React.CSSProperties = { ...avatarStyle, backgroundColor: "#5436da" }
  const botAvatarStyle: React.CSSProperties = { ...avatarStyle, backgroundColor: "#5436da" }
  const messageBubbleStyle: React.CSSProperties = { borderRadius: 12, padding: "12px 16px", fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", maxWidth: "calc(100% - 48px)" }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#343541" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: 12 }}>
          <button onClick={createNewChat} style={{ width: "100%", padding: 12, borderRadius: 8, backgroundColor: "#5436da", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div style={{ fontSize: 11, color: "#6b6b6b", textTransform: "uppercase", padding: "8px", fontWeight: 500 }}>Recent</div>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setCurrentChatId(chat.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: 6, cursor: "pointer", marginBottom: 2, backgroundColor: currentChatId === chat.id ? "#343541" : "transparent", color: "#ececf1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <MessageSquare size={16} />
                <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</span>
              </div>
              <button onClick={(e) => deleteChat(e, chat.id)} style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: 4, opacity: 0, display: "flex" }} className="delete-btn">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #343541" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 6, cursor: "pointer", color: "#ececf1", fontSize: 14 }}>
            <Settings size={16} />
            Settings
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowModelDropdown(!showModelDropdown)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, backgroundColor: "#202123", border: "1px solid #4a4a4a", color: "white", cursor: "pointer", fontSize: 14 }}>
              <span>{currentModel?.name}</span>
              {currentModel?.free && <span style={{ fontSize: 10, backgroundColor: "#22c55e", color: "white", padding: "2px 6px", borderRadius: 4 }}>FREE</span>}
              <ChevronDown size={16} />
            </button>
            
            {showModelDropdown && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, width: 280, maxHeight: 400, overflowY: "auto", backgroundColor: "#202123", border: "1px solid #4a4a4a", borderRadius: 12, zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: "12px 16px", fontSize: 11, color: "#6b6b6b", fontWeight: 500, borderBottom: "1px solid #343541" }}>FREE MODELS</div>
                {freeModels.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false) }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", backgroundColor: selectedModel === m.id ? "#343541" : "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: "#6b6b6b" }}>{m.provider}</div></div>
                    {selectedModel === m.id && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} />}
                  </button>
                ))}
                <div style={{ padding: "12px 16px", fontSize: 11, color: "#6b6b6b", fontWeight: 500, borderTop: "1px solid #343541", borderBottom: "1px solid #343541" }}>PAID MODELS</div>
                {paidModels.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false) }} style={{ width: "100%", padding: "12px 16px", textAlign: "left", backgroundColor: selectedModel === m.id ? "#343541" : "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: "#6b6b6b" }}>{m.provider}</div></div>
                    {selectedModel === m.id && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", backgroundColor: voiceEnabled ? "rgba(34, 197, 94, 0.2)" : "transparent", color: voiceEnabled ? "#22c55e" : "#9ca3af" }}>
            {voiceEnabled ? "🔊 Voice On" : "🔇"}
          </button>
        </div>

        {/* Messages */}
        <div style={messagesStyle}>
          {messages.map(message => (
            <div key={message.id} style={messageContainerStyle}>
              <div style={message.role === "user" ? userAvatarStyle : botAvatarStyle}>
                {message.role === "user" ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
              </div>
              <div style={{ ...messageBubbleStyle, backgroundColor: message.role === "user" ? "#5436da" : "#343541", color: "white" }}>{message.content}</div>
            </div>
          ))}
          
          {isLoading && (
            <div style={messageContainerStyle}>
              <div style={botAvatarStyle}><Bot size={20} color="white" /></div>
              <div style={{ display: "flex", gap: 4, paddingTop: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#999", animation: "bounce 1s infinite" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#999", animation: "bounce 1s infinite 0.15s" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#999", animation: "bounce 1s infinite 0.3s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={inputContainerStyle}>
          <div style={{ ...inputStyle, height: 56, display: "flex", alignItems: "center", position: "relative" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} placeholder="Send a message..." disabled={isLoading} style={{ ...inputStyle, height: "auto", minHeight: 44, maxHeight: 200, border: "none", background: "transparent", paddingRight: 40, position: "absolute", inset: 0 }} />
            <button onClick={handleSubmit} disabled={!hasContent || isLoading} style={{ position: "absolute", right: 8, bottom: 8, padding: 6, borderRadius: 6, border: "none", cursor: hasContent && !isLoading ? "pointer" : "not-allowed", backgroundColor: hasContent && !isLoading ? "#22c55e" : "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowUp size={18} color="white" />
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#6b6b6b", marginTop: 8 }}>{currentModel?.name} • AI can make mistakes.</p>
        </div>
      </div>

      {showModelDropdown && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setShowModelDropdown(false)} />}

      <style>{`
        .delete-btn:hover { opacity: 1 !important; }
        div:hover .delete-btn { opacity: 1; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  )
}