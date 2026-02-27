import { cp, mkdir, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { checkbox } from "@inquirer/prompts";
import { installPlatformHook, isPlatformHookInstalled } from "../core/hooks.js";
import {
  getAgentsSkillPath,
  getPlatformSkillPath,
  getRelativeTarget,
  getSkillSourcePath,
  isCanonicalInstalled,
  isPlatformLinked,
  isSameRealPath,
  pathExists,
  type Scope,
  safeLstat,
} from "../core/paths.js";
import { PLATFORMS, type PlatformConfig } from "../core/platforms.js";
import { isInteractive } from "../ui/interactive.js";
import { COLORS, ICONS } from "../ui/palette.js";

interface InstallOptions {
  scope?: string;
  platforms?: string;
  force?: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const scope: Scope = (options.scope as Scope | undefined) ?? "user";
  let selectedPlatforms: PlatformConfig[];

  if (options.platforms) {
    const ids = options.platforms.split(",").map((s) => s.trim());
    selectedPlatforms = PLATFORMS.filter((p) => ids.includes(p.id));
  } else if (isInteractive()) {
    const scopeBase = scope === "project" ? process.cwd() : homedir();
    const detected: boolean[] = [];
    for (const p of PLATFORMS) {
      detected.push(await pathExists(resolve(scopeBase, p.configDir)));
    }
    const anyDetected = detected.some(Boolean);

    const chosen = await checkbox({
      message: "Which platforms? (space to select, enter to confirm)",
      choices: PLATFORMS.map((p, i) => ({
        name: `${p.displayName}  (${p.configDir}/)`,
        value: p,
        checked: anyDetected ? detected[i] : true,
      })),
    });
    selectedPlatforms = chosen;
  } else {
    // Non-interactive: install for all detected platforms, fallback to all
    const scopeBase = scope === "project" ? process.cwd() : homedir();
    const detected = [];
    for (const p of PLATFORMS) {
      if (await pathExists(resolve(scopeBase, p.configDir))) {
        detected.push(p);
      }
    }
    selectedPlatforms = detected.length > 0 ? detected : [...PLATFORMS];
  }

  if (selectedPlatforms.length === 0) {
    console.log(`  ${ICONS.error} ${COLORS.error("No platforms selected.")}`);
    process.exit(1);
  }

  const source = getSkillSourcePath();
  if (!(await pathExists(source))) {
    console.log(
      `  ${ICONS.error} ${COLORS.error("Skill source not found at")} ${source}`,
    );
    process.exit(1);
  }

  console.log();

  // 1. Canonical: .agents/skills/knowpatch ← cp -r from source
  const canonicalPath = getAgentsSkillPath(scope);
  if (await isCanonicalInstalled(canonicalPath)) {
    console.log(
      `  ${ICONS.ok} ${COLORS.success("Canonical:")} ${canonicalPath}`,
    );
  } else {
    const existing = await safeLstat(canonicalPath);
    if (existing !== null) {
      // Legacy symlink → auto-convert (no --force needed)
      if (existing.isSymbolicLink()) {
        await rm(canonicalPath, { force: true });
      } else {
        // Something else exists — need --force
        if (!options.force) {
          console.log(
            `  ${ICONS.drift} ${COLORS.warn("Canonical path exists but is not ours — skipping.")}`,
          );
          console.log(`  ${COLORS.dim("Use --force or remove it manually.")}`);
          process.exit(1);
        }
        await rm(canonicalPath, { recursive: true, force: true });
      }
    }
    await mkdir(dirname(canonicalPath), { recursive: true });
    await cp(source, canonicalPath, { recursive: true });
    console.log(
      `  ${ICONS.ok} ${COLORS.success("Canonical:")} ${canonicalPath}`,
    );
  }

  // 2. Per-platform symlinks: .<platform>/skills/knowpatch → .agents/skills/knowpatch (relative)
  let count = 0;
  for (const platform of selectedPlatforms) {
    const platformPath = getPlatformSkillPath(platform, scope);

    if (await isPlatformLinked(platformPath, canonicalPath)) {
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} symlink already correct`,
      );
    } else if (await isSameRealPath(platformPath, canonicalPath)) {
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} shared via parent symlink`,
      );
    } else if (await pathExists(platformPath)) {
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`${platform.displayName}:`)} path exists but is not ours — skipping`,
      );
      continue;
    } else {
      await mkdir(dirname(platformPath), { recursive: true });
      const relTarget = getRelativeTarget(platformPath, canonicalPath);
      await symlink(relTarget, platformPath);
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} ${platformPath} ${ICONS.arrow} ${canonicalPath}`,
      );
    }

    // 3. Hook registration
    if (platform.supportsHooks) {
      if (await isPlatformHookInstalled(platform, scope)) {
        console.log(
          `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook already registered`,
        );
      } else {
        await installPlatformHook(platform, scope);
        console.log(
          `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook registered in settings.json`,
        );
      }
    }

    count++;
  }

  console.log();
  console.log(
    `  Done! Installed for ${count} platform${count !== 1 ? "s" : ""}.`,
  );
}
