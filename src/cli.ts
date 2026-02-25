#!/usr/bin/env node
import { Command } from "commander";
import { select } from "@inquirer/prompts";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { checkCommand } from "./commands/check.js";
import { updateCommand } from "./commands/update.js";
import { isInteractive } from "./ui/interactive.js";
import { COLORS } from "./ui/palette.js";
import pkg from "../package.json";

const program = new Command();

program
  .name("knowpatch")
  .description(
    "LLM knowledge cutoff compensator — manages the knowpatch skill for Claude Code",
  )
  .version(pkg.version);

program
  .command("install")
  .description("Install the skill by creating a symlink")
  .option("--scope <scope>", "Installation scope: user or project", "user")
  .option("--force", "Replace existing symlink without confirmation")
  .action(installCommand);

program
  .command("uninstall")
  .description("Remove the skill symlink")
  .option("--scope <scope>", "Uninstall scope: user or project", "user")
  .action(uninstallCommand);

program
  .command("check")
  .description(
    "Validate corrections against live package data — reports OK/DRIFT/ERROR",
  )
  .action(checkCommand);

program
  .command("update")
  .description(
    "Run live lookups and update drifted entries in corrections files",
  )
  .option("--yes", "Skip confirmation prompt")
  .action(updateCommand);

// Interactive menu when no subcommand is given
if (process.argv.length <= 2) {
  if (isInteractive()) {
    console.log();
    console.log(`  ${COLORS.title("Knowpatch")}`);
    console.log(
      `  ${COLORS.dim("LLM knowledge cutoff compensator for Claude Code")}`,
    );
    console.log();

    select({
      message: "What would you like to do?",
      choices: [
        { name: "Install skill", value: "install" },
        { name: "Uninstall skill", value: "uninstall" },
        { name: "Check corrections", value: "check" },
        { name: "Update corrections", value: "update" },
      ],
    }).then((action) => {
      process.argv.push(action);
      program.parse();
    });
  } else {
    program.parse();
  }
} else {
  program.parse();
}
