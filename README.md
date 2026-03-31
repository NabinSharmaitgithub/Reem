# Reem - Friendly Voice AI Assistant

A beautiful, friendly AI voice assistant built with Next.js for web deployment and Python for desktop use.

![Reem AI](https://img.shields.io/badge/Reem-AI%20Assistant-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-blue)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **Multiple LLM Models** - Switch between GPT-3.5, GPT-4, Claude 3, Llama 3, Mixtral
- 🔊 **Text-to-Speech** - Voice output using browser Speech Synthesis
- 💬 **Beautiful UI** - Modern chat interface with voice controls
- 🌐 **Web Ready** - Deploy to Vercel with one click
- 🖥️ **Desktop Version** - Python CLI for local use
- 📱 **Responsive** - Works on mobile and desktop

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd reem_ai
   git init
   git add .
   git commit -m "Initial commit - Reem AI Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/reem-ai.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key (get free at https://openrouter.ai/keys)
   - Click "Deploy"!

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
cd reem_ai/web
vercel
# Follow the prompts, add OPENROUTER_API_KEY when asked
```

## 📁 Project Structure

```
reem_ai/
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
│
├── config/                      # Python config
│   └── settings.py
│
├── modules/                     # Python modules
│   ├── ai_brain.py
│   ├── voice_input.py
│   ├── wake_word.py
│   ├── tts.py
│   └── gui.py
│
├── reem_cli.py                  # Desktop CLI version
├── reem_gui.py                  # Desktop GUI version
│
└── web/                         # Next.js Web Version (Vercel)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Main chat UI
    │   │   ├── layout.tsx       # Root layout
    │   │   ├── globals.css      # Global styles
    │   │   └── api/chat/
    │   │       └── route.ts     # API route (OpenRouter)
    │   └── lib/
    │       └── utils.ts         # Utility functions
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── next.config.js
    ├── vercel.json
    └── .env.example
```

## 🔧 Configuration

### Web Version (.env)
```env
OPENROUTER_API_KEY=your_key_here
```

### Available Models
| Model | Provider | ID |
|-------|----------|-----|
| GPT-3.5 Turbo | OpenAI | gpt-3.5 |
| GPT-4 Turbo | OpenAI | gpt-4 |
| Claude 3 Haiku | Anthropic | claude-3 |
| Llama 3 8B | Meta | llama-3 |
| Mixtral 8x7B | Mistral | mixtral |

## 💻 Local Development

### Web Version
```bash
cd web

# Install dependencies
npm install

# Set environment variable
export OPENROUTER_API_KEY=your_key

# Run development server
npm run dev
# Open http://localhost:3000
```

### Desktop Version (Python)
```bash
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your API key

python reem_cli.py
```

## 🎯 Usage

### Web Interface
1. Select a model from the dropdown (GPT-3.5, GPT-4, Claude, etc.)
2. Type your message and press Enter or click Send
3. Toggle voice on/off with the Voice button
4. Click Clear to reset the conversation

### Desktop CLI
```
Choose mode:
1. Voice - Say "Hey Reem" to activate
2. Text - Type messages directly
```

## 🔐 Security

- Never commit `.env` files to version control
- API keys stored in environment variables
- `.gitignore` excludes sensitive files
- Vercel automatically encrypts environment variables

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Pull requests welcome! Key areas:
- Better voice recognition
- More AI model integrations
- Mobile native app (React Native/Flutter)
- Desktop GUI improvements

---

**Made with ❤️ using Next.js + Tailwind + OpenRouter**

Get free API credits: [OpenRouter.ai](https://openrouter.ai/keys)