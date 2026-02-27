import { lstat, mkdir, readlink, rm, symlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { select } from "@inquirer/prompts";
import { installHook, isHookInstalled } from "../core/hooks.js";
import {
  getSkillSourcePath,
  getSkillTargetPath,
  isLinkedToUs,
  pathExists,
  type Scope,
} from "../core/paths.js";
import { isInteractive } from "../ui/interactive.js";
import { COLORS, ICONS } from "../ui/palette.js";
import { startSpinner } from "../ui/spinner.js";

interface InstallOptions {
  scope?: string;
  force?: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  let scope: Scope = (options.scope as Scope) ?? "user";

  // Interactive scope selection if not specified via flag
  if (!options.scope && isInteractive()) {
    scope = await select({
      message: "Select installation scope:",
      choices: [
        {
          name: "User (~/.claude/skills/)  — available in all projects",
          value: "user" as const,
        },
        {
          name: "Project (./.claude/skills/) — project-specific",
          value: "project" as const,
        },
      ],
    });
  }

  const source = getSkillSourcePath();
  const target = getSkillTargetPath(scope);

  // Check source exists
  if (!(await pathExists(source))) {
    console.log(
      `  ${ICONS.error} ${COLORS.error("Skill source not found at")} ${source}`,
    );
    process.exit(1);
  }

  // Check if already linked to us
  if (await isLinkedToUs(target)) {
    console.log(
      `  ${ICONS.ok} ${COLORS.success("Already installed")} — symlink is correct.`,
    );
    return;
  }

  // Check if target exists but is something else
  if (await pathExists(target)) {
    try {
      const stat = await lstat(target);
      if (stat.isSymbolicLink()) {
        const existingTarget = await readlink(target);
        console.log(
          `  ${ICONS.drift} ${COLORS.warn("Existing symlink:")} ${target} ${ICONS.arrow} ${existingTarget}`,
        );
        if (!options.force) {
          console.log(`  ${COLORS.dim("Use --force to replace.")}`);
          process.exit(1);
        }
        await rm(target);
      } else if (stat.isDirectory()) {
        console.log(
          `  ${ICONS.error} ${COLORS.error("Target is an existing directory (not a symlink).")}`,
        );
        console.log(
          `  ${COLORS.dim("Back up or remove it manually before installing.")}`,
        );
        process.exit(1);
      }
    } catch {
      // lstat failed — path doesn't exist after all
    }
  }

  // Install symlink
  const spinner = startSpinner("Installing skill symlink...");

  await mkdir(dirname(target), { recursive: true });
  await symlink(resolve(source), target);

  spinner.succeed(`Skill linked: ${target} ${ICONS.arrow} ${source}`);

  // Install hook
  if (await isHookInstalled(scope)) {
    console.log(
      `  ${ICONS.ok} ${COLORS.success("Hook already registered")} in settings.json`,
    );
  } else {
    const hookSpinner = startSpinner("Registering UserPromptSubmit hook...");
    await installHook(scope);
    hookSpinner.succeed("Hook registered in settings.json");
  }
}
