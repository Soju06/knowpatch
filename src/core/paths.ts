import { accessSync } from "node:fs";
import { lstat, readlink, realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, relative, resolve } from "node:path";
import type { PlatformConfig } from "./platforms.js";

export type Scope = "user" | "project";

let cachedRoot: string | undefined;

/** Root of the knowpatch package (where package.json lives) */
export function getPackageRoot(): string {
  if (cachedRoot) return cachedRoot;
  let dir = dirname(new URL(import.meta.url).pathname);
  while (true) {
    try {
      accessSync(resolve(dir, "package.json"));
      cachedRoot = dir;
      return dir;
    } catch {
      const parent = dirname(dir);
      if (parent === dir) {
        throw new Error("Could not find knowpatch package root");
      }
      dir = parent;
    }
  }
}

/** Path to the skill content directory inside the package */
export function getSkillSourcePath(): string {
  return resolve(getPackageRoot(), "skills/knowpatch");
}

function getScopeBase(scope: Scope): string {
  return scope === "project" ? process.cwd() : homedir();
}

/** .agents/skills/knowpatch — canonical location */
export function getAgentsSkillPath(scope: Scope): string {
  return resolve(getScopeBase(scope), ".agents/skills/knowpatch");
}

/** .<platform>/skills/knowpatch — platform-specific symlink location */
export function getPlatformSkillPath(
  platform: PlatformConfig,
  scope: Scope,
): string {
  return resolve(
    getScopeBase(scope),
    platform.configDir,
    platform.skillsSubpath,
  );
}

/** .<platform>/settings.json — platform settings path (for hook registration) */
export function getPlatformSettingsPath(
  platform: PlatformConfig,
  scope: Scope,
): string | null {
  if (platform.hookType === "none") return null;
  return resolve(getScopeBase(scope), platform.configDir, "settings.json");
}

/** Absolute path to the built hook detect script */
export function getHookCommand(): string {
  return `node ${resolve(getPackageRoot(), "bin/detect.js")}`;
}

/** Safe lstat that returns null instead of throwing */
export async function safeLstat(
  path: string,
): Promise<Awaited<ReturnType<typeof lstat>> | null> {
  try {
    return await lstat(path);
  } catch {
    return null;
  }
}

/** Check if skill is installed at canonical path (real directory + SKILL.md exists) */
export async function isCanonicalInstalled(
  canonicalPath: string,
): Promise<boolean> {
  try {
    const s = await stat(canonicalPath);
    if (!s.isDirectory()) return false;
    const skillMd = resolve(canonicalPath, "SKILL.md");
    const ms = await stat(skillMd);
    return ms.isFile();
  } catch {
    return false;
  }
}

/** Check if platform path is a symlink pointing to canonical */
export async function isPlatformLinked(
  platformPath: string,
  canonicalPath: string,
): Promise<boolean> {
  try {
    const s = await lstat(platformPath);
    if (!s.isSymbolicLink()) return false;
    const link = await readlink(platformPath);
    const resolved = resolve(dirname(platformPath), link);
    return resolved === resolve(canonicalPath);
  } catch {
    return false;
  }
}

/** Compute relative path for platform symlink */
export function getRelativeTarget(
  linkPath: string,
  targetPath: string,
): string {
  return relative(dirname(linkPath), targetPath);
}

/** Check if two paths resolve to the same real location (detects parent-level symlinks) */
export async function isSameRealPath(
  path1: string,
  path2: string,
): Promise<boolean> {
  try {
    return (await realpath(path1)) === (await realpath(path2));
  } catch {
    try {
      const parent1 = await realpath(dirname(path1));
      const parent2 = await realpath(dirname(path2));
      return parent1 === parent2 && basename(path1) === basename(path2);
    } catch {
      return false;
    }
  }
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
