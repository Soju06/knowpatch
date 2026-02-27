#!/usr/bin/env node

/**
 * UserPromptSubmit hook for knowpatch.
 * Reads the user prompt from stdin, checks for version-sensitive keywords,
 * and outputs a contextual hint if relevant.
 */

const KEYWORDS = [
  // package actions
  "install",
  "add",
  "create",
  "init",
  "scaffold",
  "upgrade",
  "migrate",
  "latest",
  "version",
  "dependency",
  // JS ecosystem
  "npm",
  "bun",
  "yarn",
  "pnpm",
  "package.json",
  "node_modules",
  // Python ecosystem
  "pip",
  "uv",
  "poetry",
  "pyproject",
  "requirements.txt",
  // Rust
  "cargo",
  // specific packages/tools
  "shadcn",
  "tailwind",
  "vite",
  "zod",
  "eslint",
  "prettier",
  "react",
  "next",
  "svelte",
  "nuxt",
  "vue",
  "angular",
  "django",
  "fastapi",
  "pydantic",
  "ruff",
  "flask",
  // AI/LLM
  "claude",
  "gpt",
  "gemini",
  "openai",
  "anthropic",
  "kimi",
  "minimax",
  "glm",
  "deepseek",
  "qwen",
  "llama",
  "mistral",
  "open-source",
  "self-hosted",
  "recommend",
  "model",
  "llm",
  "sdk",
  // runtimes
  "node",
  "python",
  "typescript",
  "deno",
  // platforms/services
  "supabase",
  "vercel",
  "jwks",
];

async function main() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let prompt: string;
  try {
    const data = JSON.parse(input);
    prompt = data.prompt ?? "";
  } catch {
    return;
  }

  const lower = prompt.toLowerCase();
  const matched = KEYWORDS.some((kw) => lower.includes(kw));

  if (matched) {
    console.log(
      [
        "This task appears to involve package versions, tool configurations, or AI model recommendations.",
        "The knowpatch skill has up-to-date corrections for common version drift",
        "(e.g., renamed packages, changed APIs, new model IDs, current open-source frontier models).",
        'Consider using Skill("knowpatch") to check for relevant corrections before proceeding.',
      ].join("\n"),
    );
  }
}

main();
