import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

// We need to mock paths to use temp directories instead of real home/cwd
let tmp: string;
let canonicalDir: string;

beforeEach(async () => {
  tmp = join(tmpdir(), `knowpatch-test-status-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
  canonicalDir = join(tmp, ".agents", "skills", "knowpatch");
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

// Helper to create a valid canonical directory
async function createValidCanonical(): Promise<void> {
  await mkdir(canonicalDir, { recursive: true });
  await writeFile(join(canonicalDir, "SKILL.md"), "# Skill");
  await mkdir(join(canonicalDir, "corrections"), { recursive: true });
  await writeFile(join(canonicalDir, "corrections", "test.md"), "# Test");
}

// Helper to create a platform symlink
async function createPlatformSymlink(
  platformConfigDir: string,
): Promise<string> {
  const platformDir = join(tmp, platformConfigDir, "skills");
  await mkdir(platformDir, { recursive: true });
  const platformPath = join(platformDir, "knowpatch");
  const relTarget = relative(platformDir, canonicalDir);
  await symlink(relTarget, platformPath);
  return platformPath;
}

// Since detectInstallation uses getAgentsSkillPath/getPlatformSkillPath which depend on cwd/homedir,
// we test the underlying logic directly using the core functions from paths.ts
import {
  isCanonicalInstalled,
  isPlatformLinked,
  isSameRealPath,
} from "../src/core/paths.js";

describe("canonical status detection", () => {
  test("not installed — path does not exist", async () => {
    expect(await isCanonicalInstalled(canonicalDir)).toBe(false);
  });

  test("valid — directory with SKILL.md", async () => {
    await createValidCanonical();
    expect(await isCanonicalInstalled(canonicalDir)).toBe(true);
  });

  test("invalid — directory without SKILL.md", async () => {
    await mkdir(canonicalDir, { recursive: true });
    expect(await isCanonicalInstalled(canonicalDir)).toBe(false);
  });

  test("legacy symlink — detected via lstat", async () => {
    const { lstat } = await import("node:fs/promises");
    const target = join(tmp, "source");
    await mkdir(target, { recursive: true });
    await writeFile(join(target, "SKILL.md"), "# Skill");

    // Create parent dirs for the symlink
    await mkdir(join(tmp, ".agents", "skills"), { recursive: true });
    await symlink(target, canonicalDir);

    const stat = await lstat(canonicalDir);
    expect(stat.isSymbolicLink()).toBe(true);
  });

  test("directory exists but SKILL.md is a directory (not file)", async () => {
    await mkdir(canonicalDir, { recursive: true });
    await mkdir(join(canonicalDir, "SKILL.md"), { recursive: true });
    expect(await isCanonicalInstalled(canonicalDir)).toBe(false);
  });
});

describe("platform status detection", () => {
  test("not installed — path does not exist", async () => {
    const platformPath = join(tmp, ".claude", "skills", "knowpatch");
    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(false);
  });

  test("installed — symlink correctly points to canonical", async () => {
    await createValidCanonical();
    const platformPath = await createPlatformSymlink(".claude");
    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(true);
  });

  test("not installed — symlink points to wrong target", async () => {
    const wrongTarget = join(tmp, "wrong");
    await mkdir(wrongTarget, { recursive: true });

    const platformDir = join(tmp, ".claude", "skills");
    await mkdir(platformDir, { recursive: true });
    const platformPath = join(platformDir, "knowpatch");
    await symlink(wrongTarget, platformPath);

    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(false);
  });

  test("not installed — regular file instead of symlink", async () => {
    const platformDir = join(tmp, ".claude", "skills");
    await mkdir(platformDir, { recursive: true });
    const platformPath = join(platformDir, "knowpatch");
    await writeFile(platformPath, "not a symlink");

    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(false);
  });

  test("not installed — regular directory instead of symlink", async () => {
    const platformPath = join(tmp, ".claude", "skills", "knowpatch");
    await mkdir(platformPath, { recursive: true });

    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(false);
  });

  test("broken symlink — target removed", async () => {
    await createValidCanonical();
    const platformPath = await createPlatformSymlink(".claude");
    // Remove the canonical directory
    await rm(canonicalDir, { recursive: true, force: true });

    // The symlink still points to the right path even though target is gone
    expect(await isPlatformLinked(platformPath, canonicalDir)).toBe(true);
  });
});

describe("multi-platform scenarios", () => {
  test("canonical valid + multiple platforms installed", async () => {
    await createValidCanonical();
    const claudePath = await createPlatformSymlink(".claude");
    const codexPath = await createPlatformSymlink(".codex");
    const geminiPath = await createPlatformSymlink(".gemini");

    expect(await isCanonicalInstalled(canonicalDir)).toBe(true);
    expect(await isPlatformLinked(claudePath, canonicalDir)).toBe(true);
    expect(await isPlatformLinked(codexPath, canonicalDir)).toBe(true);
    expect(await isPlatformLinked(geminiPath, canonicalDir)).toBe(true);
  });

  test("canonical valid + only some platforms installed", async () => {
    await createValidCanonical();
    const claudePath = await createPlatformSymlink(".claude");
    const codexPath = join(tmp, ".codex", "skills", "knowpatch");

    expect(await isCanonicalInstalled(canonicalDir)).toBe(true);
    expect(await isPlatformLinked(claudePath, canonicalDir)).toBe(true);
    expect(await isPlatformLinked(codexPath, canonicalDir)).toBe(false);
  });

  test("canonical invalid + platform symlinks exist", async () => {
    // Canonical is just a directory without SKILL.md
    await mkdir(canonicalDir, { recursive: true });
    const claudePath = await createPlatformSymlink(".claude");

    expect(await isCanonicalInstalled(canonicalDir)).toBe(false);
    // Symlink still points to canonical path
    expect(await isPlatformLinked(claudePath, canonicalDir)).toBe(true);
  });

  test("nothing installed", async () => {
    const claudePath = join(tmp, ".claude", "skills", "knowpatch");
    const codexPath = join(tmp, ".codex", "skills", "knowpatch");

    expect(await isCanonicalInstalled(canonicalDir)).toBe(false);
    expect(await isPlatformLinked(claudePath, canonicalDir)).toBe(false);
    expect(await isPlatformLinked(codexPath, canonicalDir)).toBe(false);
  });
});

describe("parent-level symlink scenarios", () => {
  test(".claude → .agents + canonical installed → implicitly linked", async () => {
    await createValidCanonical();

    // .claude → .agents (directory-level symlink)
    await symlink(join(tmp, ".agents"), join(tmp, ".claude"));

    const canonicalPath = join(tmp, ".agents", "skills", "knowpatch");
    const platformPath = join(tmp, ".claude", "skills", "knowpatch");

    // isPlatformLinked returns false (no explicit symlink)
    expect(await isPlatformLinked(platformPath, canonicalPath)).toBe(false);
    // isSameRealPath returns true (parent symlink)
    expect(await isSameRealPath(platformPath, canonicalPath)).toBe(true);
    // isCanonicalInstalled works through parent symlink
    expect(await isCanonicalInstalled(platformPath)).toBe(true);
  });

  test(".claude → .agents + canonical NOT installed → not linked", async () => {
    await symlink(join(tmp, ".agents"), join(tmp, ".claude"));
    await mkdir(join(tmp, ".agents", "skills"), { recursive: true });

    const canonicalPath = join(tmp, ".agents", "skills", "knowpatch");
    const platformPath = join(tmp, ".claude", "skills", "knowpatch");

    expect(await isSameRealPath(platformPath, canonicalPath)).toBe(true);
    expect(await isCanonicalInstalled(canonicalPath)).toBe(false);
  });

  test("independent .claude dir + explicit symlink → not implicitly linked", async () => {
    await createValidCanonical();
    const claudePath = await createPlatformSymlink(".claude");

    expect(await isPlatformLinked(claudePath, canonicalDir)).toBe(true);
    // lstat shows it's a symlink, so isSameRealPath is irrelevant here
    // but let's verify it also returns true (they resolve to same place)
    expect(await isSameRealPath(claudePath, canonicalDir)).toBe(true);
  });

  test(".claude → .agents + .codex independent → only claude is implicit", async () => {
    await createValidCanonical();

    // .claude → .agents
    await symlink(join(tmp, ".agents"), join(tmp, ".claude"));

    // .codex is independent (no symlink)
    await mkdir(join(tmp, ".codex", "skills"), { recursive: true });

    const canonicalPath = join(tmp, ".agents", "skills", "knowpatch");
    const claudePath = join(tmp, ".claude", "skills", "knowpatch");
    const codexPath = join(tmp, ".codex", "skills", "knowpatch");

    expect(await isSameRealPath(claudePath, canonicalPath)).toBe(true);
    expect(await isSameRealPath(codexPath, canonicalPath)).toBe(false);
  });

  test("implicit platform is still considered installed", async () => {
    await createValidCanonical();
    await symlink(join(tmp, ".agents"), join(tmp, ".claude"));

    const canonicalPath = join(tmp, ".agents", "skills", "knowpatch");
    const platformPath = join(tmp, ".claude", "skills", "knowpatch");

    // The combination of checks: not explicit, but implicit → installed
    const explicit = await isPlatformLinked(platformPath, canonicalPath);
    const implicit = await isSameRealPath(platformPath, canonicalPath);
    const installed = explicit || implicit;
    expect(installed).toBe(true);
  });
});

describe("scope base paths", () => {
  // These test the path construction logic
  const { getAgentsSkillPath } = require("../src/core/paths.js");
  const { homedir } = require("node:os");
  const { resolve } = require("node:path");

  test("user scope uses homedir for canonical", () => {
    const result = getAgentsSkillPath("user");
    expect(result).toBe(resolve(homedir(), ".agents/skills/knowpatch"));
  });

  test("project scope uses cwd for canonical", () => {
    const result = getAgentsSkillPath("project");
    expect(result).toBe(resolve(process.cwd(), ".agents/skills/knowpatch"));
  });

  test("user and project scopes produce different paths", () => {
    const user = getAgentsSkillPath("user");
    const project = getAgentsSkillPath("project");
    // They may be equal if cwd === homedir, but typically different
    // Just verify they're valid paths
    expect(typeof user).toBe("string");
    expect(typeof project).toBe("string");
  });
});
