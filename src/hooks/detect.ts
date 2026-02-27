#!/usr/bin/env node

/**
 * UserPromptSubmit hook for knowpatch.
 * Data-driven detection engine: reads correction file YAML tags as keywords,
 * matches against the user prompt, and injects relevant correction entries
 * directly into the system reminder. No hardcoded keywords — all detection
 * is derived from correction files.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface CorrectionEntry {
  header: string;
  body: string;
}

interface CorrectionFile {
  tags: string[];
  entries: CorrectionEntry[];
}

/** Find keywords from the keyword list that match in the prompt */
export function findMatchedKeywords(
  prompt: string,
  keywords: readonly string[],
): string[] {
  const lower = prompt.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw));
}

/** Extract tags from YAML frontmatter */
export function parseFrontmatterTags(content: string): string[] {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = fmMatch?.[1];
  if (!frontmatter) return [];
  const tagMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
  const tagList = tagMatch?.[1];
  if (!tagList) return [];
  return tagList.split(",").map((t) => t.trim().replace(/['"]/g, ""));
}

/** Extract ### correction entries from markdown content.
 *  Splits on both ## and ### boundaries so that ## meta sections
 *  are not absorbed into the preceding entry's body. */
export function extractEntries(content: string): CorrectionEntry[] {
  const entries: CorrectionEntry[] = [];
  const parts = content.split(/(?=^#{2,3} )/m);
  for (const part of parts) {
    const headerMatch = part.match(/^### (.+)/);
    const header = headerMatch?.[1];
    if (header) {
      entries.push({ header, body: part.trim() });
    }
  }
  return entries;
}

/** Build the system-reminder message from matched entries */
export function buildMessage(
  entries: CorrectionEntry[],
  keywords: readonly string[],
): string {
  if (entries.length === 0) return "";
  const body = entries.map((e) => e.body).join("\n\n");
  return [
    `[knowpatch] Technical context (topics: ${keywords.join(", ")}).`,
    "",
    body,
    "",
    'For full correction details, activate the knowpatch skill: Skill("knowpatch")',
  ].join("\n");
}

/** Resolve corrections directory relative to this script's location */
function getCorrectionsDir(): string {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  return resolve(scriptDir, "..", "corrections");
}

/** Load all correction files, returning parsed tags and entries */
export function loadCorrections(correctionsDir: string): CorrectionFile[] {
  let files: string[];
  try {
    files = readdirSync(correctionsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const corrections: CorrectionFile[] = [];
  for (const file of files) {
    const content = readFileSync(resolve(correctionsDir, file), "utf-8");
    corrections.push({
      tags: parseFrontmatterTags(content),
      entries: extractEntries(content),
    });
  }
  return corrections;
}

/** Filter correction entries matching the given keywords */
export function filterEntries(
  corrections: CorrectionFile[],
  keywords: string[],
): CorrectionEntry[] {
  const keywordSet = new Set(keywords);
  const matched: CorrectionEntry[] = [];

  for (const file of corrections) {
    const hasTagOverlap = file.tags.some((tag) => keywordSet.has(tag));
    if (!hasTagOverlap) continue;

    for (const entry of file.entries) {
      const headerLower = entry.header.toLowerCase();
      if (keywords.some((kw) => headerLower.includes(kw))) {
        matched.push(entry);
      }
    }
  }

  return matched;
}

async function main() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let prompt: string;
  try {
    const data = JSON.parse(input) as { prompt?: string };
    prompt = data.prompt ?? "";
  } catch {
    return;
  }

  const correctionsDir = getCorrectionsDir();

  // Load corrections and derive keywords from tags
  const corrections = loadCorrections(correctionsDir);
  const allTags = [...new Set(corrections.flatMap((c) => c.tags))];

  const keywords = findMatchedKeywords(prompt, allTags);
  if (keywords.length === 0) return;

  const entries = filterEntries(corrections, keywords);
  const message = buildMessage(entries, keywords);

  if (message) {
    console.log(message);
  }
}

main();
