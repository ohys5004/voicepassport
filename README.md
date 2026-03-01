# VoicePassport

**Your voice, every language.** Record a 30-second self-introduction, and VoicePassport clones your voice to generate natural introductions in 11 languages — all shareable via a single link and QR code.

## What it does

1. **Record** — Speak naturally for 30 seconds in your language
2. **Clone & Translate** — Your voice is cloned, your intro is culturally adapted (not just translated) into 11 languages
3. **Share** — Get a unique link + QR code with your voice business card

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| **Voice Cloning & TTS** | ElevenLabs API (Instant Voice Cloning + eleven_multilingual_v2) |
| **Speech-to-Text** | ElevenLabs Scribe V2 |
| **Translation** | Mistral AI (mistral-small-latest) — cultural adaptation, not literal translation |
| **One-liner Generation** | Mistral AI + LinkedIn headline scraping |
| **Storage** | File-based JSON storage |

## Supported Languages

English, Korean, Japanese, Chinese (Mandarin), Spanish, French, German, Portuguese, Italian, Hindi, Arabic

## How to Run

```bash
cd app
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

### Environment Variables

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

## Architecture

```
User speaks (30s)
  → ElevenLabs Scribe V2 (STT)
  → Mistral AI (cultural adaptation to 11 languages)
  → ElevenLabs Voice Cloning (clone user's voice)
  → ElevenLabs TTS (generate speech in each language)
  → Shareable VoicePassport page with QR code
```

## Key Features

- **Instant Voice Cloning** — Your actual voice speaking other languages
- **Cultural Adaptation** — Not word-for-word translation; each language sounds like a native speaker
- **TTS Optimization** — Text preprocessing removes filler words and pause-causing characters
- **QR Code** — Scannable link to your VoicePassport
- **Mobile-First** — Responsive design optimized for all devices
- **One-Click Share** — Unique URL for each passport

## Built at Mistral AI Worldwide Hackathon 2026

NYC location | ElevenLabs Challenge — Best use of ElevenLabs

## Team

- Kelly Oh
