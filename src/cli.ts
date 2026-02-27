#!/usr/bin/env node
import { Command } from "commander";
import { select } from "@inquirer/prompts";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
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
