import { cp, mkdir, readdir, readFile, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { checkbox } from "@inquirer/prompts";
import {
  installPlatformHook,
  isPlatformHookInstalled,
  isPlatformHookUpToDate,
  uninstallPlatformHook,
} from "../core/hooks.js";
import { getUpdateCommand } from "../core/package-manager.js";
import { parseFrontmatter } from "../core/parser.js";
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
import { checkForUpdate } from "../core/version.js";
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
    const syncResult = await syncCanonical(source, canonicalPath);
    console.log(`  ${ICONS.ok} ${COLORS.success("Canonical:")} ${syncResult}`);
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
        if (!(await isPlatformHookUpToDate(platform, scope))) {
          await uninstallPlatformHook(platform, scope);
          await installPlatformHook(platform, scope);
          console.log(
            `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook updated`,
          );
        } else {
          console.log(
            `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook already registered`,
          );
        }
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

  // Non-blocking update notification
  showUpdateNotification().catch(() => {});
}

/** Read the version field from a SKILL.md or correction file's YAML frontmatter */
async function readFileVersion(filePath: string): Promise<string | undefined> {
  try {
    const content = await readFile(filePath, "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    return (frontmatter as Record<string, unknown> | null)?.version as
      | string
      | undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sync canonical installation with source, using file-level version patching.
 * Returns a human-readable status string.
 */
async function syncCanonical(
  source: string,
  canonicalPath: string,
): Promise<string> {
  const installedVersion = await readFileVersion(
    resolve(canonicalPath, "SKILL.md"),
  );
  const sourceVersion = await readFileVersion(resolve(source, "SKILL.md"));

  // No version tag → v0.3 legacy → full re-sync
  if (!installedVersion) {
    await rm(canonicalPath, { recursive: true, force: true });
    await mkdir(dirname(canonicalPath), { recursive: true });
    await cp(source, canonicalPath, { recursive: true });
    return `migrated from legacy → ${sourceVersion ?? "latest"}`;
  }

  // Same version → up to date
  if (installedVersion === sourceVersion) {
    return `up to date (${installedVersion})`;
  }

  // Different version → file-level patch
  const patched = await patchFiles(source, canonicalPath);
  return `updated ${installedVersion} → ${sourceVersion ?? "latest"} (${patched} file${patched !== 1 ? "s" : ""})`;
}

/**
 * Patch individual files by comparing source and installed versions.
 * Returns the number of files patched.
 */
async function patchFiles(source: string, installed: string): Promise<number> {
  let patched = 0;

  // Patch SKILL.md
  const srcSkillVer = await readFileVersion(resolve(source, "SKILL.md"));
  const instSkillVer = await readFileVersion(resolve(installed, "SKILL.md"));
  if (srcSkillVer !== instSkillVer) {
    await cp(resolve(source, "SKILL.md"), resolve(installed, "SKILL.md"));
    patched++;
  }

  // Patch corrections/
  const srcCorr = resolve(source, "corrections");
  const instCorr = resolve(installed, "corrections");
  await mkdir(instCorr, { recursive: true });

  const srcFiles = (await pathExists(srcCorr))
    ? (await readdir(srcCorr)).filter((f) => f.endsWith(".md"))
    : [];
  const instFiles = (await pathExists(instCorr))
    ? (await readdir(instCorr)).filter((f) => f.endsWith(".md"))
    : [];

  const srcSet = new Set(srcFiles);
  const instSet = new Set(instFiles);

  // Copy new or updated files
  for (const file of srcFiles) {
    const srcVer = await readFileVersion(resolve(srcCorr, file));
    const instVer = instSet.has(file)
      ? await readFileVersion(resolve(instCorr, file))
      : undefined;

    if (srcVer !== instVer || !instSet.has(file)) {
      await cp(resolve(srcCorr, file), resolve(instCorr, file));
      patched++;
    }
  }

  // Remove files that no longer exist in source
  for (const file of instFiles) {
    if (!srcSet.has(file)) {
      await rm(resolve(instCorr, file), { force: true });
      patched++;
    }
  }

  // Patch bin/detect.js if source has it
  const srcDetect = resolve(source, "bin/detect.js");
  const instDetect = resolve(installed, "bin/detect.js");
  if (await pathExists(srcDetect)) {
    await mkdir(resolve(installed, "bin"), { recursive: true });
    await cp(srcDetect, instDetect);
    patched++;
  }

  return patched;
}

/** Show a non-blocking update notification after install */
async function showUpdateNotification(): Promise<void> {
  const pkgPath = resolve(
    dirname(new URL(import.meta.url).pathname),
    "../../package.json",
  );
  let currentVersion: string;
  try {
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8")) as {
      version: string;
    };
    currentVersion = pkg.version;
  } catch {
    return;
  }

  const newer = await checkForUpdate(currentVersion);
  if (!newer) return;

  const updateCmd = getUpdateCommand();
  console.log();
  console.log(
    `  ${ICONS.drift} ${COLORS.warn(`Update available: ${currentVersion} → ${newer}`)}`,
  );
  console.log(`    Run ${COLORS.info(updateCmd)} to update`);
}
