import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { getSkillSourcePath } from "./paths.js";

export interface CorrectionEntry {
  id: string;
  package: string;
  lookup: string;
  cached_version: string | null;
  last_checked: string;
  /** Source file name */
  file: string;
}

export interface CorrectionFile {
  ecosystem: string;
  description: string;
  tags: string[];
  last_updated: string;
  entries: CorrectionEntry[];
  /** Raw markdown body below frontmatter */
  body: string;
  /** Source file name */
  file: string;
}

interface FrontmatterEntry {
  id: string;
  package: string;
  lookup: string;
  cached_version: string | null;
  last_checked: string;
}

interface Frontmatter {
  ecosystem: string;
  description: string;
  tags: string[];
  last_updated: string;
  entries: FrontmatterEntry[];
}

/** Parse YAML frontmatter and markdown body from a corrections file */
export function parseFrontmatter(content: string): { frontmatter: Frontmatter | null; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }
  const frontmatter = parseYaml(match[1] ?? "") as Frontmatter;
  const body = match[2] ?? "";
  return { frontmatter, body };
}

/** Parse a single corrections file */
export function parseCorrectionFile(filename: string, content: string): CorrectionFile {
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    // Fallback for files without frontmatter
    return {
      ecosystem: filename.replace(".md", ""),
      description: "",
      tags: [],
      last_updated: "",
      entries: [],
      body: content,
      file: filename,
    };
  }

  const entries: CorrectionEntry[] = (frontmatter.entries ?? []).map((e) => ({
    ...e,
    file: filename,
  }));

  return {
    ecosystem: frontmatter.ecosystem,
    description: frontmatter.description,
    tags: frontmatter.tags ?? [],
    last_updated: frontmatter.last_updated,
    entries,
    body,
    file: filename,
  };
}

/** Parse all corrections files and return structured data */
export async function parseAllCorrections(): Promise<CorrectionFile[]> {
  const correctionsDir = resolve(getSkillSourcePath(), "corrections");
  const files = await readdir(correctionsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const results: CorrectionFile[] = [];

  for (const file of mdFiles) {
    const content = await readFile(resolve(correctionsDir, file), "utf-8");
    results.push(parseCorrectionFile(file, content));
  }

  return results;
}

/** Get all entries across all correction files */
export async function parseCorrections(): Promise<CorrectionEntry[]> {
  const files = await parseAllCorrections();
  return files.flatMap((f) => f.entries);
}

/** Find correction files matching any of the given tags */
export async function findByTags(tags: string[]): Promise<CorrectionFile[]> {
  const files = await parseAllCorrections();
  const lowerTags = tags.map((t) => t.toLowerCase());
  return files.filter((f) =>
    f.tags.some((t) => lowerTags.includes(t.toLowerCase()))
  );
}
