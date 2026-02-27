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

export function getUpdateCommand(): string {
  const pm = detectPackageManager();
  const cmds: Record<PackageManager, string> = {
    bun: "bun update -g knowpatch",
    npm: "npm update -g knowpatch",
    pnpm: "pnpm update -g knowpatch",
    yarn: "yarn global upgrade knowpatch",
  };
  return cmds[pm];
}
