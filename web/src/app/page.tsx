"use client"

import React, { useState, useRef, useEffect } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ArrowUp, Paperclip, Square, X, StopCircle, Mic, Globe, BrainCog, Code, ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

const styles = `
  *:focus-visible { outline-offset: 0 !important; --ring-offset: 0 !important; }
  textarea::-webkit-scrollbar { width: 6px; }
  textarea::-webkit-scrollbar-track { background: transparent; }
  textarea::-webkit-scrollbar-thumb { background-color: #444444; border-radius: 3px; }
  textarea::-webkit-scrollbar-thumb:hover { background-color: #555555; }
`

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-transparent",
        className
      )}
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
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    }
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full",
    }
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const VoiceRecorder: React.FC<{
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: (duration: number) => void
  visualizerBars?: number
}> = ({ isRecording, onStartRecording, onStopRecording, visualizerBars = 32 }) => {
  const [time, setTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      onStartRecording()
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      onStopRecording(time)
      setTime(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("flex flex-col items-center justify-center w-full transition-all duration-300 py-3", isRecording ? "opacity-100" : "opacity-0 h-0")}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-sm text-white/80">{formatTime(time)}</span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-white/50 animate-pulse"
            style={{ height: `${Math.max(15, Math.random() * 100)}%`, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  )
}

const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px] mx-1">
    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full" />
  </div>
)

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

const MODELS = [
  { id: "gpt-3.5", name: "GPT-3.5", provider: "OpenAI" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "llama-3", name: "Llama 3", provider: "Meta" },
  { id: "mixtral", name: "Mixtral", provider: "Mistral" },
]

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5")
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showThink, setShowThink] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  const currentModel = MODELS.find(m => m.id === selectedModel)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, model: selectedModel }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        model: data.model || currentModel?.name
      }

      setMessages(prev => [...prev, assistantMessage])

      if (voiceEnabled && data.response) {
        const utterance = new SpeechSynthesisUtterance(data.response)
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }])
    }

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoice = () => setVoiceEnabled(!voiceEnabled)

  const clearChat = () => {
    setMessages([{ id: "welcome", role: "assistant", content: "Hello! I'm Reem. Select a model and start chatting!", timestamp: new Date() }])
  }

  const hasContent = input.trim() !== ""

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1F2023] rounded-3xl shadow-2xl overflow-hidden border border-[#333333]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-5 text-center">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">🤖 Reem</h1>
            <p className="text-white/80 text-sm mt-1">Friendly Voice AI Assistant</p>
          </div>

          {/* Model Selector & Status */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#2E3033] border-b border-[#333333]">
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F2023] border border-[#444444] hover:border-[#667eea] transition-all text-sm"
              >
                <span className="text-white">{currentModel?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-[#1F2023] border border-[#333333] rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false) }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-[#2E3033]",
                        selectedModel === model.id ? "text-[#667eea]" : "text-gray-300"
                      )}
                    >
                      <div><div>{model.name}</div><div className="text-xs text-gray-500">{model.provider}</div></div>
                      {selectedModel === model.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", isLoading ? "bg-[#ffc107] animate-pulse" : "bg-[#28a745]")} />
              <span className="text-sm text-white/70">{isLoading ? "Thinking..." : "Ready"}</span>
            </div>
          </div>

          {/* Chat Container */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col gap-1 max-w-[80%]", message.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{message.role === "user" ? "👤" : "🤖"}</span>
                  {message.model && message.role === "assistant" && <span className="text-xs text-gray-500">{message.model}</span>}
                </div>
                <div className={cn("px-4 py-2 rounded-2xl", message.role === "user" ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-br-sm" : "bg-[#2E3033] text-gray-100 rounded-bl-sm")}>
                  {message.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <span className="text-xl">🤖</span>
                <div className="bg-[#2E3033] px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2E3033] border-t border-[#333333]">
            <button onClick={toggleVoice} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all", voiceEnabled ? "bg-[#667eea]/20 text-[#667eea] border border-[#667eea]" : "bg-transparent text-gray-400")}>
              {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
            </button>
            <button onClick={clearChat} className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent text-gray-400 hover:text-white">🗑️ Clear</button>
          </div>

          {/* Input */}
          <div className="p-3 bg-[#1F2023] border-t border-[#333333]">
            <div className={cn("rounded-3xl border border-[#444444] bg-[#1F2023] p-2 transition-all duration-300", isLoading && "border-red-500/70")}>
              
              {isRecording && (
                <VoiceRecorder isRecording={isRecording} onStartRecording={() => {}} onStopRecording={(duration) => { setIsRecording(false); setInput(`[Voice message - ${duration}s]`) }} />
              )}

              <div className={cn("transition-all duration-300", isRecording ? "h-0 overflow-hidden opacity-0" : "opacity-100")}>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="text-base"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => { setShowSearch(!showSearch); setShowThink(false) }} className={cn("flex items-center gap-1 px-2 py-1 rounded-full h-8 transition-all", showSearch ? "bg-[#1EAEDB]/15 border border-[#1EAEDB] text-[#1EAEDB]" : "bg-transparent text-gray-400 hover:text-white")}>
                    <Globe className="w-4 h-4" />
                    {showSearch && <span className="text-xs">Search</span>}
                  </button>
                  <CustomDivider />
                  <button onClick={() => { setShowThink(!showThink); setShowSearch(false) }} className={cn("flex items-center gap-1 px-2 py-1 rounded-full h-8 transition-all", showThink ? "bg-[#8B5CF6]/15 border border-[#8B5CF6] text-[#8B5CF6]" : "bg-transparent text-gray-400 hover:text-white")}>
                    <BrainCog className="w-4 h-4" />
                    {showThink && <span className="text-xs">Think</span>}
                  </button>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      className={cn("h-8 w-8 rounded-full", isRecording ? "bg-transparent text-red-500" : hasContent ? "bg-white text-black" : "bg-transparent text-gray-400")}
                      onClick={() => { if (isRecording) setIsRecording(false); else if (hasContent) handleSubmit(); else setIsRecording(true) }}
                    >
                      {isLoading ? <Square className="h-4 w-4 fill-black animate-pulse" /> : isRecording ? <StopCircle className="h-5 w-5" /> : hasContent ? <ArrowUp className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isLoading ? "Stop" : isRecording ? "Stop" : hasContent ? "Send" : "Voice"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModelDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />}
    </TooltipProvider>
  )
}