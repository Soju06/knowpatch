#!/usr/bin/env node
import { ExitPromptError } from "@inquirer/core";
import { select } from "@inquirer/prompts";
import { Command } from "commander";
import pkg from "../package.json";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { updateCommand } from "./commands/update.js";
import type { Scope } from "./core/paths.js";
import { detectInstallation } from "./core/status.js";
import { checkForUpdate } from "./core/version.js";
import { isInteractive } from "./ui/interactive.js";
import { COLORS, ICONS } from "./ui/palette.js";

process.on("uncaughtException", (err) => {
  if (err instanceof ExitPromptError) {
    console.log();
    process.exit(0);
  }
  throw err;
});

const program = new Command();

program
  .name("knowpatch")
  .description("LLM knowledge cutoff compensator")
  .version(pkg.version);

program
  .command("install")
  .description("Install the skill by creating symlinks")
  .option("--scope <scope>", "Installation scope: user or project")
  .option(
    "--platforms <list>",
    "Comma-separated platform IDs: claude,codex,gemini",
  )
  .option("--force", "Replace existing symlinks without confirmation")
  .action(installCommand);

program
  .command("update")
  .description("Sync installation and check for updates")
  .option("--scope <scope>", "Installation scope: user or project")
  .option("--reconfigure", "Interactively reconfigure platform selection")
  .action((opts: { scope?: string; reconfigure?: boolean }) =>
    updateCommand(opts, pkg.version),
  );

program
  .command("uninstall")
  .description("Remove the skill symlinks and hooks")
  .option("--scope <scope>", "Uninstall scope: user or project")
  .option("--platforms <list>", "Comma-separated platform IDs to remove")
  .action(uninstallCommand);

// Interactive menu when no subcommand is given
if (process.argv.length <= 2) {
  if (isInteractive()) {
    console.log();
    console.log(`  ${COLORS.title(`Knowpatch v${pkg.version}`)}`);
    console.log(`  ${COLORS.dim("LLM knowledge cutoff compensator")}`);

    // Non-blocking update check
    const newer = await checkForUpdate(pkg.version);
    if (newer) {
      console.log();
      console.log(
        `  ${ICONS.drift} ${COLORS.warn(`Update available: ${pkg.version} → ${newer}`)}`,
      );
      console.log(
        `  ${COLORS.dim("  Run")} bun update -g knowpatch ${COLORS.dim("to update")}`,
      );
    }

    console.log();

    // 1. Scope selection
    const scope: Scope = await select({
      message: "Scope:",
      choices: [
        { name: "User (~/…)", value: "user" as const },
        { name: "Project (./)", value: "project" as const },
      ],
    });

    // 2. Detect installation status
    const status = await detectInstallation(scope);
    const hasInstallation = status.canonical.valid;

    if (hasInstallation) {
      // Show installed platforms
      const installed = status.platforms.filter((ps) => ps.installed);
      if (installed.length > 0) {
        console.log();
        console.log(
          `  Installed: ${installed.map((ps) => `${ps.platform.displayName} ${ICONS.ok}`).join(", ")}`,
        );
      }

      console.log();

      const action = await select({
        message: "What would you like to do?",
        choices: [
          { name: "Update", value: "update" },
          { name: "Uninstall", value: "uninstall" },
        ],
      });

      if (action === "update") {
        await updateCommand({ scope }, pkg.version);
      } else {
        await uninstallCommand({ scope });
      }
    } else {
      await installCommand({ scope });
    }
  } else {
    program.parse();
  }
} else {
  program.parse();
}
