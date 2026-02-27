import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { getSkillSourcePath } from "./paths.js";

export interface CorrectionFile {
  ecosystem: string;
  description: string;
  tags: string[];
  version?: string;
  last_updated: string;
  /** Raw markdown body below frontmatter */
  body: string;
  /** Source file name */
  file: string;
}

interface Frontmatter {
  ecosystem: string;
  description: string;
  tags: string[];
  version?: string;
  last_updated: string;
}

/** Parse YAML frontmatter and markdown body from a corrections file */
export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter | null;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }
  const frontmatter = parseYaml(match[1] ?? "") as Frontmatter;
  const body = match[2] ?? "";
  return { frontmatter, body };
}

/** Parse a single corrections file */
export function parseCorrectionFile(
  filename: string,
  content: string,
): CorrectionFile {
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    // Fallback for files without frontmatter
    return {
      ecosystem: filename.replace(".md", ""),
      description: "",
      tags: [],
      last_updated: "",
      body: content,
      file: filename,
    };
  }

  return {
    ecosystem: frontmatter.ecosystem,
    description: frontmatter.description,
    tags: frontmatter.tags ?? [],
    version: frontmatter.version,
    last_updated: frontmatter.last_updated,
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

/** Find correction files matching any of the given tags */
export async function findByTags(tags: string[]): Promise<CorrectionFile[]> {
  const files = await parseAllCorrections();
  const lowerTags = tags.map((t) => t.toLowerCase());
  return files.filter((f) =>
    f.tags.some((t) => lowerTags.includes(t.toLowerCase())),
  );
}
