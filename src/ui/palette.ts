import chalk from "chalk";

export const ICONS = {
  ok: chalk.green("✓"),
  drift: chalk.yellow("⚠"),
  error: chalk.red("✗"),
  arrow: chalk.dim("→"),
  bullet: chalk.dim("•"),
} as const;

export const COLORS = {
  title: chalk.bold,
  dim: chalk.dim,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
} as const;
