import { rm } from "node:fs/promises";
import { confirm } from "@inquirer/prompts";
import {
  getSkillTargetPath,
  isLinkedToUs,
  pathExists,
  type Scope,
} from "../core/paths.js";
import { uninstallHook } from "../core/hooks.js";
import { isInteractive } from "../ui/interactive.js";
import { startSpinner } from "../ui/spinner.js";
import { ICONS, COLORS } from "../ui/palette.js";

interface UninstallOptions {
  scope?: string;
}

export async function uninstallCommand(options: UninstallOptions): Promise<void> {
  const scope: Scope = (options.scope as Scope) ?? "user";
  const target = getSkillTargetPath(scope);

  if (!(await pathExists(target))) {
    console.log(`  ${ICONS.ok} ${COLORS.dim("Nothing to uninstall — symlink does not exist.")}`);
    return;
  }

  if (!(await isLinkedToUs(target))) {
    console.log(
      `  ${ICONS.error} ${COLORS.error("Target exists but does not point to this package.")}`,
    );
    console.log(`  ${COLORS.dim("Refusing to remove — manual cleanup required.")}`);
    process.exit(1);
  }

  // Confirm in interactive mode
  if (isInteractive()) {
    const proceed = await confirm({
      message: `Remove skill symlink at ${target}?`,
      default: true,
    });
    if (!proceed) {
      console.log(`  ${COLORS.dim("Cancelled.")}`);
      return;
    }
  }

  const spinner = startSpinner("Removing skill symlink...");
  await rm(target);
  spinner.succeed(`Skill symlink removed from ${scope} scope.`);

  // Remove hook
  const hookSpinner = startSpinner("Removing hook from settings.json...");
  const removed = await uninstallHook(scope);
  if (removed) {
    hookSpinner.succeed("Hook removed from settings.json");
  } else {
    hookSpinner.info("No hook entry found in settings.json");
  }
}
