import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { parseFrontmatter, type CorrectionFile } from "./parser.js";
import { getSkillSourcePath } from "./paths.js";

/** Serialize a CorrectionFile back to YAML frontmatter + markdown */
export function serializeCorrectionFile(file: CorrectionFile): string {
  const frontmatter = {
    ecosystem: file.ecosystem,
    description: file.description,
    tags: file.tags,
    last_updated: file.last_updated,
    entries: file.entries.map((e) => ({
      id: e.id,
      package: e.package,
      lookup: e.lookup,
      cached_version: e.cached_version,
      last_checked: e.last_checked,
    })),
  };

  const yamlStr = stringifyYaml(frontmatter, { lineWidth: 0 });
  return `---\n${yamlStr}---\n${file.body}`;
}

/** Update a specific entry's cached_version and last_checked in a correction file */
export async function updateEntry(
  filename: string,
  entryId: string,
  version: string,
): Promise<void> {
  const correctionsDir = resolve(getSkillSourcePath(), "corrections");
  const filePath = resolve(correctionsDir, filename);
  const content = await readFile(filePath, "utf-8");

  const { frontmatter, body } = parseFrontmatter(content);
  if (!frontmatter) {
    throw new Error(`No frontmatter found in ${filename}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  const entry = frontmatter.entries.find((e) => e.id === entryId);
  if (!entry) {
    throw new Error(`Entry "${entryId}" not found in ${filename}`);
  }

  entry.cached_version = version;
  entry.last_checked = today;
  frontmatter.last_updated = today;

  const yamlStr = stringifyYaml(frontmatter, { lineWidth: 0 });
  const output = `---\n${yamlStr}---\n${body}`;

  await writeFile(filePath, output, "utf-8");
}
