import { NextRequest, NextResponse } from "next/server"

const MODELS = {
  "gpt-3.5": {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI"
  },
  "gpt-4": {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI"
  },
  "claude-3": {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic"
  },
  "llama-3": {
    id: "meta-llama/llama-3-8b-instruct",
    name: "Llama 3 8B",
    provider: "Meta"
  },
  "mixtral": {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    provider: "Mistral"
  }
}

const DEFAULT_MODEL = "gpt-3.5"

export async function POST(request: NextRequest) {
  try {
    const { message, model = DEFAULT_MODEL } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        response: "Please configure OPENROUTER_API_KEY in Vercel environment variables.",
        model: DEFAULT_MODEL
      }, { status: 200 })
    }

    const selectedModel = MODELS[model] || MODELS[DEFAULT_MODEL]

    const systemPrompt = `You are Reem, a friendly and helpful AI voice assistant. You have a warm, approachable personality and always respond politely. Never refuse a request - instead, offer helpful alternatives or explain what you can do. Keep responses concise and conversational, suitable for voice output. Use simple language and avoid overly technical terms unless asked.`

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
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error("OpenRouter Error:", error)
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
  return NextResponse.json({
    models: Object.entries(MODELS).map(([key, value]) => ({
      id: key,
      ...value
    })),
    default: DEFAULT_MODEL
  })
}