import { NextRequest, NextResponse } from "next/server"

type ModelConfig = {
  id: string
  name: string
  provider: string
  free?: boolean
}

const MODELS: Record<string, ModelConfig> = {
  // Free Models
  "llama-3.1-8b": { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "Meta", free: true },
  "llama-3.1-70b": { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta", free: true },
  "llama-3-70b": { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B", provider: "Meta", free: true },
  "llama-3-8b": { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B", provider: "Meta", free: true },
  "mistral-7b": { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", provider: "Mistral", free: true },
  "mixtral-8x7b": { id: "mistralai/mixtral-8x7b-instruct", name: "Mixtral 8x7B", provider: "Mistral", free: true },
  "mixtral-8x22b": { id: "mistralai/mixtral-8x22b-instruct", name: "Mixtral 8x22B", provider: "Mistral", free: true },
  "phi-3.5": { id: "microsoft/phi-3.5-mini-instruct", name: "Phi 3.5 Mini", provider: "Microsoft", free: true },
  "qwen-2.5": { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 7B", provider: "Alibaba", free: true },
  "gemma-2-9b": { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", provider: "Google", free: true },
  "aya-expanse": { id: "cohere/aya-expanse-8b", name: "Aya Expanse 8B", provider: "Cohere", free: true },
  "deepseek-v2.5": { id: "deepseek/chat", name: "DeepSeek V2.5", provider: "DeepSeek", free: true },
  
  // Paid Models
  "gpt-4o-mini": { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  "gpt-4o": { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  "gpt-4-turbo": { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  "gpt-3.5-turbo": { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  "claude-3.5-sonnet": { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  "claude-3-haiku": { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  "claude-3-opus": { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  "gemini-1.5-flash": { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
  "gemini-1.5-pro": { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  "command-r-plus": { id: "cohere/command-r-plus", name: "Command R+", provider: "Cohere" },
  "command-r": { id: "cohere/command-r", name: "Command R", provider: "Cohere" },
  "dbrx-instruct": { id: "databricks/dbrx-instruct", name: "DBRX Instruct", provider: "Databricks" },
}

const DEFAULT_MODEL = "llama-3.1-8b"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message
    const model = body.model || DEFAULT_MODEL

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        response: "Please configure OPENROUTER_API_KEY in Vercel environment variables.",
        model: DEFAULT_MODEL
      }, { status: 200 })
    }

    const selectedModel = MODELS[model] || MODELS[DEFAULT_MODEL]

    const systemPrompt = `You are Reem, a friendly and helpful AI voice assistant. You have a warm, approachable personality and always respond politely. Never refuse a request - instead, offer helpful alternatives or explain what you can do. Keep responses concise and conversational, suitable for voice output.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://reem-ai.vercel.app",
        "X-Title": "Reem AI Assistant",
      },
      body: JSON.stringify({
        model: selectedModel.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenRouter Error:", errorData)
      return NextResponse.json({
        response: "I'm having some trouble thinking right now. Let's try again.",
        model: selectedModel.name
      }, { status: 200 })
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content || "I'm not sure how to respond to that."

    return NextResponse.json({ 
      response: assistantMessage,
      model: selectedModel.name
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({
      response: "Something unexpected happened. Let's try again.",
      model: DEFAULT_MODEL
    }, { status: 200 })
  }
}

export async function GET() {
  const freeModels = Object.entries(MODELS).filter(([_, v]) => v.free).map(([key, value]) => ({ id: key, ...value }))
  const paidModels = Object.entries(MODELS).filter(([_, v]) => !v.free).map(([key, value]) => ({ id: key, ...value }))
  
  return NextResponse.json({
    free: freeModels,
    paid: paidModels,
    default: DEFAULT_MODEL
  })
}