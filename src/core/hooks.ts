import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  getHookCommand,
  getPlatformSettingsPath,
  type Scope,
} from "./paths.js";
import type { PlatformConfig } from "./platforms.js";

interface HookEntry {
  type: "command";
  command: string;
}

interface HookMatcher {
  matcher: string;
  hooks: HookEntry[];
}

interface Settings {
  hooks?: {
    UserPromptSubmit?: HookMatcher[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const HOOK_MARKER = "knowpatch";

function isOurHook(matcher: HookMatcher, hookCmd: string): boolean {
  return (
    matcher.hooks.some(
      (h) => h.type === "command" && h.command.includes(HOOK_MARKER),
    ) ||
    matcher.hooks.some((h) => h.type === "command" && h.command === hookCmd)
  );
}

async function readSettings(path: string): Promise<Settings> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

async function writeSettings(path: string, settings: Settings): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
}

/** Check if the knowpatch hook is installed for a platform */
export async function isPlatformHookInstalled(
  platform: PlatformConfig,
  scope: Scope,
): Promise<boolean> {
  if (platform.hookType === "none") return false;
  const settingsPath = getPlatformSettingsPath(platform, scope);
  if (!settingsPath) return false;

  const settings = await readSettings(settingsPath);
  const hookCmd = getHookCommand(scope);
  const entries = settings.hooks?.UserPromptSubmit ?? [];
  return entries.some((m) => isOurHook(m, hookCmd));
}

/** Check if the installed hook command matches the expected command for this scope */
export async function isPlatformHookUpToDate(
  platform: PlatformConfig,
  scope: Scope,
): Promise<boolean> {
  if (platform.hookType === "none") return true;
  const settingsPath = getPlatformSettingsPath(platform, scope);
  if (!settingsPath) return true;

  const hookCmd = getHookCommand(scope);
  const settings = await readSettings(settingsPath);
  const entries = settings.hooks?.UserPromptSubmit ?? [];

  return entries.some((m) =>
    m.hooks.some((h) => h.type === "command" && h.command === hookCmd),
  );
}

/** Add the knowpatch hook to a platform's settings.json */
export async function installPlatformHook(
  platform: PlatformConfig,
  scope: Scope,
): Promise<boolean> {
  if (platform.hookType === "none") return false;
  const settingsPath = getPlatformSettingsPath(platform, scope);
  if (!settingsPath) return false;

  const hookCmd = getHookCommand(scope);
  const settings = await readSettings(settingsPath);

  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = [];
  }

  if (settings.hooks.UserPromptSubmit.some((m) => isOurHook(m, hookCmd))) {
    return false;
  }

  settings.hooks.UserPromptSubmit.push({
    matcher: "",
    hooks: [{ type: "command", command: hookCmd }],
  });

  await writeSettings(settingsPath, settings);
  return true;
}

/** Remove the knowpatch hook from a platform's settings.json */
export async function uninstallPlatformHook(
  platform: PlatformConfig,
  scope: Scope,
): Promise<boolean> {
  if (platform.hookType === "none") return false;
  const settingsPath = getPlatformSettingsPath(platform, scope);
  if (!settingsPath) return false;

  const hookCmd = getHookCommand(scope);
  const settings = await readSettings(settingsPath);
  const hooks = settings.hooks;
  const entries = hooks?.UserPromptSubmit;
  if (!hooks || !entries) return false;

  const filtered = entries.filter((m) => !isOurHook(m, hookCmd));
  if (filtered.length === entries.length) return false;

  hooks.UserPromptSubmit = filtered;

  if (hooks.UserPromptSubmit.length === 0) {
    delete hooks.UserPromptSubmit;
  }
  if (Object.keys(hooks).length === 0) {
    delete settings.hooks;
  }

  await writeSettings(settingsPath, settings);
  return true;
}
