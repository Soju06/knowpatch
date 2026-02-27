import { cp, mkdir, rm, symlink } from "node:fs/promises";
import { dirname } from "node:path";
import { checkbox, confirm } from "@inquirer/prompts";
import { installPlatformHook, uninstallPlatformHook } from "../core/hooks.js";
import {
  getAgentsSkillPath,
  getPlatformSkillPath,
  getRelativeTarget,
  getSkillSourcePath,
  isSameRealPath,
  pathExists,
  type Scope,
} from "../core/paths.js";
import { PLATFORMS } from "../core/platforms.js";
import { detectInstallation } from "../core/status.js";
import { checkForUpdate } from "../core/version.js";
import { isInteractive } from "../ui/interactive.js";
import { COLORS, ICONS } from "../ui/palette.js";
import { startSpinner } from "../ui/spinner.js";

interface UpdateOptions {
  scope?: string;
  reconfigure?: boolean;
}

async function syncInstallation(scope: Scope): Promise<void> {
  const status = await detectInstallation(scope);
  const source = getSkillSourcePath();
  const canonicalPath = getAgentsSkillPath(scope);

  // Check canonical
  if (!status.canonical.exists) {
    console.log(
      `  ${ICONS.error} ${COLORS.error("Canonical not found.")} Run ${COLORS.info("knowpatch install")} first.`,
    );
    return;
  }

  // Canonical: always re-copy to sync latest content
  if (status.canonical.isLegacySymlink) {
    console.log(
      `  ${ICONS.drift} ${COLORS.warn("Canonical:")} legacy symlink — converting to directory...`,
    );
    await rm(canonicalPath, { force: true });
  } else if (status.canonical.valid) {
    console.log(
      `  ${ICONS.ok} ${COLORS.success("Canonical:")} updating content...`,
    );
    await rm(canonicalPath, { recursive: true, force: true });
  } else {
    console.log(
      `  ${ICONS.drift} ${COLORS.warn("Canonical:")} invalid — re-creating...`,
    );
    await rm(canonicalPath, { recursive: true, force: true });
  }

  await mkdir(dirname(canonicalPath), { recursive: true });
  await cp(source, canonicalPath, { recursive: true });
  console.log(`  ${ICONS.ok} ${COLORS.success("Canonical:")} synced`);

  // Check each installed platform
  for (const ps of status.platforms) {
    if (!ps.installed) continue;
    const platformPath = getPlatformSkillPath(ps.platform, scope);

    if (ps.implicitlyLinked) {
      const hookStatus = ps.platform.supportsHooks
        ? ps.hookInstalled
          ? "hook up-to-date"
          : "hook missing"
        : "";
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} shared via parent symlink${hookStatus ? `, ${hookStatus}` : ""}`,
      );

      if (ps.platform.supportsHooks && !ps.hookInstalled) {
        await installPlatformHook(ps.platform, scope);
        console.log(
          `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} hook restored`,
        );
      }
    } else if (ps.symlinkValid) {
      const hookStatus = ps.platform.supportsHooks
        ? ps.hookInstalled
          ? "hook up-to-date"
          : "hook missing"
        : "";
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} symlink valid${hookStatus ? `, ${hookStatus}` : ""}`,
      );

      if (ps.platform.supportsHooks && !ps.hookInstalled) {
        await installPlatformHook(ps.platform, scope);
        console.log(
          `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} hook restored`,
        );
      }
    } else {
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`${ps.platform.displayName}:`)} symlink broken — re-creating...`,
      );
      await rm(platformPath, { force: true });
      await mkdir(dirname(platformPath), { recursive: true });
      const relTarget = getRelativeTarget(platformPath, canonicalPath);
      await symlink(relTarget, platformPath);
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} symlink restored`,
      );
    }
  }

  console.log();
  console.log("  All platforms synced.");
}

async function reconfigure(scope: Scope): Promise<void> {
  const status = await detectInstallation(scope);
  const canonicalPath = getAgentsSkillPath(scope);

  // Show current state
  console.log("  Current installation:");
  console.log(`  ${ICONS.bullet} Scope: ${scope}`);
  console.log(
    `  ${ICONS.bullet} Platforms: ${status.platforms
      .map(
        (ps) =>
          `${ps.platform.displayName} ${ps.installed ? ICONS.ok : ICONS.error}`,
      )
      .join(", ")}`,
  );
  console.log();

  if (!status.canonical.valid && !status.canonical.isLegacySymlink) {
    console.log(
      `  ${ICONS.error} ${COLORS.error("No canonical installation found.")} Run ${COLORS.info("knowpatch install")} first.`,
    );
    return;
  }

  const chosen = await checkbox({
    message: "Which platforms? (space to select)",
    choices: PLATFORMS.map((p) => {
      const ps = status.platforms.find((s) => s.platform.id === p.id);
      const installed = ps?.installed ?? false;
      return {
        name: `${p.displayName}  (${p.configDir}/)${installed ? " — installed" : ""}`,
        value: p,
        checked: installed,
      };
    }),
  });

  const chosenIds = new Set(chosen.map((p) => p.id));

  // Add newly selected
  for (const platform of chosen) {
    const ps = status.platforms.find((s) => s.platform.id === platform.id);
    if (ps?.installed && (ps.symlinkValid || ps.implicitlyLinked)) continue;

    const platformPath = getPlatformSkillPath(platform, scope);

    // Check for implicit link via parent symlink
    if (await isSameRealPath(platformPath, canonicalPath)) {
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} shared via parent symlink`,
      );
    } else {
      if (await pathExists(platformPath)) {
        await rm(platformPath, { force: true });
      }
      await mkdir(dirname(platformPath), { recursive: true });
      const relTarget = getRelativeTarget(platformPath, canonicalPath);
      await symlink(relTarget, platformPath);
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} ${platformPath} ${ICONS.arrow} ${canonicalPath}`,
      );
    }

    if (platform.supportsHooks) {
      await installPlatformHook(platform, scope);
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook registered`,
      );
    }
  }

  // Remove deselected
  for (const ps of status.platforms) {
    if (!ps.installed) continue;
    if (chosenIds.has(ps.platform.id)) continue;

    if (ps.implicitlyLinked) {
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`${ps.platform.displayName}:`)} shared via parent symlink — remove parent symlink or canonical instead`,
      );
      if (ps.platform.supportsHooks) {
        await uninstallPlatformHook(ps.platform, scope);
      }
      continue;
    }

    const platformPath = getPlatformSkillPath(ps.platform, scope);
    await rm(platformPath, { force: true });
    if (ps.platform.supportsHooks) {
      await uninstallPlatformHook(ps.platform, scope);
    }
    console.log(
      `  ${ICONS.ok} ${COLORS.success(`${ps.platform.displayName}:`)} removed`,
    );
  }

  const installedCount = chosen.length;
  console.log();
  console.log(
    `  Updated! Now installed for ${installedCount} platform${installedCount !== 1 ? "s" : ""}.`,
  );
}

export async function updateCommand(
  options: UpdateOptions,
  currentVersion: string,
): Promise<void> {
  const scope: Scope = (options.scope as Scope | undefined) ?? "user";

  // CLI version check
  if (isInteractive()) {
    const spinner = startSpinner("Checking for updates...");
    const newer = await checkForUpdate(currentVersion);
    spinner.stop();

    if (newer) {
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`New version available: ${currentVersion} → ${newer}`)}`,
      );
      const doUpdate = await confirm({
        message: `Update knowpatch CLI? (bun update -g knowpatch)`,
        default: true,
      });
      if (doUpdate) {
        const { execSync } = await import("node:child_process");
        try {
          execSync("bun update -g knowpatch", { stdio: "inherit" });
          console.log(`  ${ICONS.ok} ${COLORS.success(`Updated to ${newer}`)}`);
        } catch {
          console.log(
            `  ${ICONS.error} ${COLORS.error("Update failed.")} Try running manually.`,
          );
        }
      }
      console.log();
    }
  }

  console.log("  Checking installation...");
  console.log();

  if (options.reconfigure && isInteractive()) {
    await reconfigure(scope);
  } else {
    await syncInstallation(scope);
  }
}
