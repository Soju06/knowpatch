---
ecosystem: ai-models
description: AI model names, IDs, SDK versions, multimodal support
tags: [claude, gpt, gemini, openai, anthropic, model, llm, sdk, ai]
last_updated: "2026-02-24"
entries:
  - id: anthropic-claude
    package: "@anthropic-ai/sdk"
    lookup: "npm view @anthropic-ai/sdk version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: openai-gpt
    package: "openai"
    lookup: "npm view openai version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: google-gemini
    package: "@google/genai"
    lookup: "npm view @google/genai version"
    cached_version: null
    last_checked: "2026-02-24"
---

# AI Models — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [Anthropic Claude](#anthropic-claude)
- [OpenAI GPT-5 Family](#openai-gpt-5-family)
- [Google Gemini 3 Family](#google-gemini-3-family)
- [Multimodal Input Comparison](#multimodal-input-comparison)

---

### Anthropic Claude — 2026-02
- **Wrong (training data)**: Claude 3.5 Sonnet is the latest/best model, model ID `claude-3-5-sonnet-20241022`
- **Correct (current)**:
  - `claude-opus-4-6` — Highest capability
  - `claude-sonnet-4-6` — Balanced (performance/cost)
  - `claude-haiku-4-5` — Lightweight/fast (`claude-haiku-4-5-20251001`)
  - Claude 3.5 Sonnet, Claude 3 Opus — Fully legacy
- **Input**: Text, Image, PDF / **Output**: Text
- **Impact**: Using legacy IDs like `claude-3-5-sonnet`, `claude-3-opus` results in deprecated or significantly degraded performance
- **Lookup**: `npm view @anthropic-ai/sdk version`

### OpenAI GPT-5 Family — 2026-02
- **Wrong (training data)**: GPT-4 Turbo, GPT-4o are the latest/best models
- **Correct (current)**:
  - `gpt-5.3-codex` — Best agentic coding model (2026-02-05)
  - `gpt-5.3-codex-spark` — Ultra-fast real-time coding, Cerebras-powered (2026-02-12), text-only 128k
  - `gpt-5.2` — Professional work (2025-12-11)
    - ChatGPT: GPT-5.2 Instant / Thinking / Pro
    - API: `gpt-5.2`, `gpt-5.2-chat-latest`, `gpt-5.2-pro`
  - `gpt-5.2-codex` — Coding optimized
  - `gpt-5.1` — Legacy (sunset planned in ChatGPT)
  - `gpt-5` — Previous generation (still available via API, $1.25/$10 per 1M tokens)
  - `gpt-5-mini`, `gpt-5-nano` — Small variants
  - GPT-4 family (4o, 4-turbo, etc.) — Fully legacy
- **Input**: Text, Image / **Output**: Text (Codex variants are text-only)
- **Impact**: Using GPT-4 model IDs invokes legacy models with significantly degraded performance
- **Lookup**: `npm view openai version`

### Google Gemini 3 Family — 2026-02
- **Wrong (training data)**: Gemini 1.5 Pro is the latest
- **Correct (current)**:
  - Gemini 3.1 Pro (Preview) — Highest capability, 1M input tokens, 64k output tokens
  - Gemini 3 Pro — Stable version
  - Gemini 3 Flash — Fast variant
  - Gemini 2 family — Previous generation (still available)
  - Gemini 1.5 Pro — Legacy
- **Input**: **Text, Image, Video, Audio, PDF** / **Output**: Text
- **Development platforms**: Google AI Studio, Vertex AI, Google Antigravity (new agent platform)
- **Impact**: Using Gemini 1.5 models results in legacy performance; failing to inform about video/audio input support
- **Lookup**: `npm view @google/genai version`

---

### Multimodal Input Comparison — 2026-02

| Model | Text | Image | Video | Audio | PDF |
|-------|------|-------|-------|-------|-----|
| Claude Opus 4.6 | O | O | X | X | O |
| Claude Sonnet 4.6 | O | O | X | X | O |
| Claude Haiku 4.5 | O | O | X | X | O |
| GPT-5.2 (Thinking/Pro) | O | O | X | X | - |
| GPT-5.2 Instant | O | O | X | X | - |
| GPT-5.3-Codex | O | X | X | X | X |
| GPT-5.3-Codex-Spark | O | X | X | X | X |
| Gemini 3.1 Pro | O | O | O | O | O |
| Gemini 3 Pro/Flash | O | O | O | O | O |

Note: GPT-5.3-Codex variants are text-only, specialized for agentic coding. Gemini is the only family supporting video + audio input.
