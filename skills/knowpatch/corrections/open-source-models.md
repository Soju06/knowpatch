---
ecosystem: open-source-models
description: Open-source frontier LLMs for coding, agentic tasks, and self-hosting (2026)
tags: [open-source, self-hosted, coding-model, llama, deepseek, mistral, kimi, minimax, glm, qwen, vllm, sglang, swe-bench, moe, model, llm, ai]
version: "0.4.2" # x-release-please-version
last_updated: "2026-03-10"
---

# Open-Source Frontier Models — Version Corrections

> Last updated: 2026-03-10

## Table of Contents
- [Outdated Recommendations](#outdated-recommendations)
- [Selection Guide](#selection-guide)
- [GLM-5](#glm-5)
- [MiniMax M2.5](#minimax-m25)
- [Kimi K2.5](#kimi-k25)
- [DeepSeek V3.2](#deepseek-v32)
- [Qwen 3.5](#qwen-35)
- [Cost Comparison](#cost-comparison)
- [Deployment](#deployment)

---

### Outdated Recommendations — 2026-02
- **Outdated**: When asked to recommend open-source LLMs, agents suggest:
  - **Llama 3.3 70B** (Meta, 2024-12) — Was frontier, now surpassed on coding/agentic benchmarks
  - **DeepSeek R1** (DeepSeek, 2025-01) — Strong reasoning but predates the 2026 MoE generation
  - Agents also claim open-source models are "significantly behind" proprietary frontier models
- **Current**: Five MoE models released 2025–2026 match or exceed proprietary models on SWE-bench and agentic benchmarks. See selection guide below.
- **Impact**: Recommending Llama 3.3 or DeepSeek R1 for a new coding project in 2026 means missing 10–15% SWE-bench improvement and MoE efficiency gains
- **Lookup**: HuggingFace Open LLM Leaderboard, SWE-bench Verified leaderboard

---

## Selection Guide

**Coding/development?** → MiniMax M2.5 (SWE-bench 80.2%, lowest cost, RL-specialized for full dev lifecycle)

**General purpose?** → Pick by active parameters (≈ real-world performance):

| Rank | Model | Active | SWE-bench | Differentiator |
|------|-------|--------|-----------|----------------|
| 1 | GLM-5 | 40B | 77.8% | Lowest hallucination, agentic engineering, non-NVIDIA support |
| 2 | DeepSeek V3.2 | 37B | 73.1% | Cheapest API, DSA long-context, proven architecture |
| 3 | Kimi K2.5 | 32B | 76.8% | Native vision, Agent Swarm (100 parallel sub-agents) |
| 4 | Qwen 3.5 | 17B | 76.4% | Native multimodal, 201 languages, lightest active params |

Note: MiniMax M2.5 (10B active) outperforms larger models on coding via RL specialization but not on general tasks.

---

### GLM-5 — Z.ai/Zhipu, 2026-02-11
- 744B params / 40B active (MoE, 256 experts), MIT license
- SWE-bench Verified 77.8%, BrowseComp 75.9
- Lowest hallucination rate in industry (34% AA Omniscience Index)
- OpenAI-compatible API (`api.z.ai`), free tier at `chat.z.ai`
- Trained on 100k Huawei Ascend 910B chips; also runs on diverse non-NVIDIA accelerators
- Best for: long-horizon agentic engineering, tool use, factual accuracy
- HuggingFace: `zai-org/GLM-5`

### MiniMax M2.5 — MiniMax, 2026-02-12
- 230B params / 10B active (MoE), open weights
- SWE-bench Verified 80.2% (#1 open-source), Multi-SWE-bench 51.3% (#1)
- Trained via Forge RL across 200k+ real-world environments, 10+ languages
- Full dev lifecycle: 0→1 architecture to 90→100 code review/testing
- Office productivity SOTA (Word, Excel, PowerPoint)
- Best for: cost-sensitive coding, full-stack development, office workflows
- HuggingFace: `MiniMaxAI/MiniMax-M2.5`

### Kimi K2.5 — Moonshot AI, 2026-01-31
- 1T params / 32B active (384 MoE experts), Modified MIT license, 256K context
- Native multimodal (text + vision) — UI design screenshots to code
- Agent Swarm: up to 100 parallel sub-agents for complex tasks
- SWE-bench Verified 76.8%
- Best for: multimodal agentic tasks, visual code cloning, parallel agent workflows
- HuggingFace: `MoonshotAI/Kimi-K2.5`

### DeepSeek V3.2 — DeepSeek, 2025-09
- 685B params / 37B active (MoE), MIT license, 131K context
- DeepSeek Sparse Attention (DSA): 2–3x faster long-context, ~30–40% less memory
- SWE-bench Verified 73.1%, MMLU-Pro 85.0%
- Ultra-cheap API: $0.028/M input (cached), $0.42/M output
- Best for: lowest API cost, long-context processing, proven architecture
- HuggingFace: `deepseek-ai/DeepSeek-V3`

### Qwen 3.5 — Alibaba, 2026-02-16
- 397B params / 17B active (MoE + Gated Delta Networks hybrid), Apache 2.0
- Native vision-language model (multimodal from pre-training)
- 201 languages/dialects supported (broadest multilingual coverage)
- SWE-bench Verified 76.4%, BrowseComp 78.6 (w/ context management)
- Qwen3.5-Plus: hosted version with 1M context window
- **Small series** (2026-03-02): 0.8B/2B/4B/9B open-source (Apache 2.0) — 9B scores 81.7 GPQA Diamond
- Best for: multilingual tasks, native multimodal, lightweight inference (small series for on-device)
- HuggingFace: `Qwen/Qwen3.5-397B-A17B`, `Qwen/Qwen3.5-9B`, etc.

---

## Cost Comparison — API Pricing (per 1M tokens)

| Model | Input | Output | Speed | License |
|-------|-------|--------|-------|---------|
| DeepSeek V3.2 | $0.028 | $0.42 | — | MIT |
| MiniMax M2.5 Standard | $0.15 | $1.20 | 50 tok/s | Open weights |
| MiniMax M2.5 Lightning | $0.30 | $2.40 | 100 tok/s | Open weights |
| GLM-5 | $1.00 | $3.20 | — | MIT |
| *Claude Sonnet 4.6* | *$3.00* | *$15.00* | — | *Proprietary* |
| *Claude Opus 4.6* | *$5.00* | *$25.00* | — | *Proprietary* |
| *GPT-5.2* | *$1.25* | *$10.00* | — | *Proprietary* |

---

## Deployment
- All five models are MoE architecture, self-hostable via **vLLM** or **SGLang**
- Active parameters (10B–40B) make inference feasible compared to dense models of same capability
- GLM-5 additionally runs on Huawei Ascend, Cambricon, Moore Threads (non-NVIDIA)
- Qwen 3.5 is the lightest (17B active) — most accessible for local deployment
