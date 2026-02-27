import { rm } from "node:fs/promises";
import { checkbox, confirm } from "@inquirer/prompts";
import { uninstallPlatformHook } from "../core/hooks.js";
import {
  getAgentsSkillPath,
  getPlatformSkillPath,
  type Scope,
} from "../core/paths.js";
import type { PlatformConfig } from "../core/platforms.js";
import { detectInstallation } from "../core/status.js";
import { isInteractive } from "../ui/interactive.js";
import { COLORS, ICONS } from "../ui/palette.js";

interface UninstallOptions {
  scope?: string;
  platforms?: string;
}

export async function uninstallCommand(
  options: UninstallOptions,
): Promise<void> {
  const scope: Scope = (options.scope as Scope | undefined) ?? "user";
  const status = await detectInstallation(scope);

  const installed = status.platforms.filter((ps) => ps.installed);
  const hasCanonical =
    status.canonical.valid || status.canonical.isLegacySymlink;
  if (installed.length === 0 && !hasCanonical) {
    console.log(
      `  ${ICONS.ok} ${COLORS.dim("Nothing to uninstall — no installation found.")}`,
    );
    return;
  }

  // Show current state
  console.log();
  console.log("  Current installation:");
  console.log(`  ${ICONS.bullet} Scope: ${scope}`);
  if (installed.length > 0) {
    console.log(
      `  ${ICONS.bullet} Platforms: ${installed.map((ps) => `${ps.platform.displayName} ${ICONS.ok}`).join(", ")}`,
    );
  }
  console.log();

  let platformsToRemove: PlatformConfig[];

  if (options.platforms) {
    const ids = options.platforms.split(",").map((s) => s.trim());
    platformsToRemove = installed
      .filter((ps) => ids.includes(ps.platform.id))
      .map((ps) => ps.platform);
  } else if (isInteractive() && installed.length > 0) {
    platformsToRemove = await checkbox({
      message: "Remove from which platforms?",
      choices: installed.map((ps) => ({
        name: ps.platform.displayName,
        value: ps.platform,
        checked: true,
      })),
    });
  } else {
    platformsToRemove = installed.map((ps) => ps.platform);
  }

  // Remove platform symlinks + hooks
  for (const platform of platformsToRemove) {
    const ps = status.platforms.find((s) => s.platform.id === platform.id);
    const platformPath = getPlatformSkillPath(platform, scope);

    if (ps?.implicitlyLinked) {
      // parent symlink → rm would delete canonical!
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`${platform.displayName}:`)} shared via parent symlink — skipping symlink removal`,
      );
      if (platform.supportsHooks) {
        await uninstallPlatformHook(platform, scope);
        console.log(
          `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} hook unregistered`,
        );
      }
      continue;
    }

    await rm(platformPath, { force: true });
    if (platform.supportsHooks) {
      await uninstallPlatformHook(platform, scope);
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} symlink removed, hook unregistered`,
      );
    } else {
      console.log(
        `  ${ICONS.ok} ${COLORS.success(`${platform.displayName}:`)} symlink removed`,
      );
    }
  }

  // Ask about canonical removal if all platforms removed
  const remainingInstalled = installed.length - platformsToRemove.length;
  if (remainingInstalled === 0 && hasCanonical) {
    let removeCanonical = true;
    if (isInteractive()) {
      removeCanonical = await confirm({
        message: "Also remove canonical (.agents/skills/knowpatch)?",
        default: true,
      });
    }
    if (removeCanonical) {
      const canonicalPath = getAgentsSkillPath(scope);
      await rm(canonicalPath, { recursive: true, force: true });
      console.log(
        `  ${ICONS.ok} ${COLORS.success("Canonical symlink removed")}`,
      );
    }
  }

  console.log();
  console.log("  Uninstalled.");
}
