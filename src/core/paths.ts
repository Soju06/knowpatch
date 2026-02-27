import { lstat, readlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

export type Scope = "user" | "project";

/** Root of the knowpatch package (where package.json lives) */
export function getPackageRoot(): string {
  // Bundled output is bin/cli.js → package root is one level up
  return resolve(dirname(new URL(import.meta.url).pathname), "..");
}

/** Path to the skill content directory inside the package */
export function getSkillSourcePath(): string {
  return resolve(getPackageRoot(), "skills/knowpatch");
}

/** Path where the skill symlink should live */
export function getSkillTargetPath(scope: Scope = "user"): string {
  if (scope === "project") {
    return resolve(process.cwd(), ".claude/skills/knowpatch");
  }
  return resolve(homedir(), ".claude/skills/knowpatch");
}

/** Check if a path is a symlink pointing to our skill source */
export async function isLinkedToUs(targetPath: string): Promise<boolean> {
  try {
    const stat = await lstat(targetPath);
    if (!stat.isSymbolicLink()) return false;
    const linkTarget = await readlink(targetPath);
    return resolve(linkTarget) === resolve(getSkillSourcePath());
  } catch {
    return false;
  }
}

/** Path to the Claude settings.json for the given scope */
export function getSettingsPath(scope: Scope = "user"): string {
  if (scope === "project") {
    return resolve(process.cwd(), ".claude/settings.json");
  }
  return resolve(homedir(), ".claude/settings.json");
}

/** Absolute path to the built hook detect script */
export function getHookCommand(): string {
  return `node ${resolve(getPackageRoot(), "bin/detect.js")}`;
}

/** Check if a path exists (file, dir, or symlink) */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await lstat(p);
    return true;
  } catch {
    return false;
  }
}
