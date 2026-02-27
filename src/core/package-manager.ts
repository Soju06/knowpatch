import { getPackageRoot } from "./paths.js";

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export function detectPackageManager(): PackageManager {
  // 1. npm_config_user_agent (set when run via PM scripts)
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("bun/")) return "bun";
  if (ua.startsWith("pnpm/")) return "pnpm";
  if (ua.startsWith("yarn/")) return "yarn";
  if (ua.startsWith("npm/")) return "npm";

  // 2. Installation path pattern
  const root = getPackageRoot();
  if (root.includes(".bun/")) return "bun";
  if (root.includes("/pnpm/")) return "pnpm";
  if (root.includes("/yarn/")) return "yarn";

  return "npm";
}

/** Detect if running from an ephemeral bunx/npx cache directory */
export function isEphemeral(): boolean {
  const root = getPackageRoot();
  // bun ephemeral: /tmp/…/bunx-… or macOS /var/folders/…/T/bunx-…
  if (/\/tmp\//.test(root) || /\/T\/bunx-/.test(root)) return true;
  // npm ephemeral: /_npx/ or /npx/
  if (/\/_npx\//.test(root) || /\/npx\//.test(root)) return true;
  return false;
}

export function getUpdateCommand(): string {
  const pm = detectPackageManager();

  if (isEphemeral()) {
    return pm === "bun" ? "bunx knowpatch@latest" : "npx knowpatch@latest";
  }

  const cmds: Record<PackageManager, string> = {
    bun: "bun update -g knowpatch",
    npm: "npm update -g knowpatch",
    pnpm: "pnpm update -g knowpatch",
    yarn: "yarn global upgrade knowpatch",
  };
  return cmds[pm];
}
