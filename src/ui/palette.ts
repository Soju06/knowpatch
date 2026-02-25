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
  version: chalk.bold.white,
} as const;

export function statusLine(status: "ok" | "drift" | "error", label: string): string {
  const icon = ICONS[status];
  const colorFn = status === "ok" ? COLORS.success : status === "drift" ? COLORS.warn : COLORS.error;
  const tag = colorFn(status.toUpperCase().padEnd(5));
  return `  ${icon} ${tag}  ${label}`;
}

export function header(text: string): string {
  return `\n  ${COLORS.title(text)}\n`;
}

export function separator(label?: string): string {
  const line = "─".repeat(30);
  return label ? `\n  ${COLORS.dim(`── ${label} ${line}`)}` : `\n  ${COLORS.dim(line)}`;
}
