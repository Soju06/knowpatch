import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getHookCommand, getSettingsPath, type Scope } from "./paths.js";

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

async function readSettings(scope: Scope): Promise<Settings> {
  const path = getSettingsPath(scope);
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

async function writeSettings(scope: Scope, settings: Settings): Promise<void> {
  const path = getSettingsPath(scope);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
}

/** Check if the knowpatch hook is already installed */
export async function isHookInstalled(scope: Scope): Promise<boolean> {
  const settings = await readSettings(scope);
  const hookCmd = getHookCommand();
  const entries = settings.hooks?.UserPromptSubmit ?? [];
  return entries.some((m) => isOurHook(m, hookCmd));
}

/** Add the knowpatch hook to settings.json */
export async function installHook(scope: Scope): Promise<boolean> {
  const hookCmd = getHookCommand();
  const settings = await readSettings(scope);

  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = [];
  }

  // Already installed — skip
  if (settings.hooks.UserPromptSubmit.some((m) => isOurHook(m, hookCmd))) {
    return false;
  }

  settings.hooks.UserPromptSubmit.push({
    matcher: "",
    hooks: [{ type: "command", command: hookCmd }],
  });

  await writeSettings(scope, settings);
  return true;
}

/** Remove the knowpatch hook from settings.json */
export async function uninstallHook(scope: Scope): Promise<boolean> {
  const settings = await readSettings(scope);
  const hookCmd = getHookCommand();
  const hooks = settings.hooks;
  const entries = hooks?.UserPromptSubmit;
  if (!hooks || !entries) return false;

  const filtered = entries.filter((m) => !isOurHook(m, hookCmd));
  if (filtered.length === entries.length) return false;

  hooks.UserPromptSubmit = filtered;

  // Clean up empty structures
  if (hooks.UserPromptSubmit.length === 0) {
    delete hooks.UserPromptSubmit;
  }
  if (Object.keys(hooks).length === 0) {
    delete settings.hooks;
  }

  await writeSettings(scope, settings);
  return true;
}
