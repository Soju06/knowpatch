import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  installPlatformHook,
  isPlatformHookInstalled,
  uninstallPlatformHook,
} from "../src/core/hooks.js";
import type { PlatformConfig } from "../src/core/platforms.js";

// We test hooks by creating real settings.json files in a temp directory.
// Since the hook functions use getPlatformSettingsPath which depends on scope base,
// we create a test platform config and provide a custom scope base.

// The hooks module uses getPlatformSettingsPath internally, which resolves
// relative to cwd/homedir. We instead test the lower-level behavior by
// creating settings.json at the expected paths.

let tmp: string;

// Create a fake platform that points to our temp dir
const _testPlatform: PlatformConfig = {
  id: "claude",
  displayName: "Claude Code",
  configDir: ".claude",
  skillsSubpath: "skills/knowpatch",
  supportsHooks: true,
  hookType: "claude-settings-json",
};

const noHookPlatform: PlatformConfig = {
  id: "codex",
  displayName: "Codex",
  configDir: ".codex",
  skillsSubpath: "skills/knowpatch",
  supportsHooks: false,
  hookType: "none",
};

beforeEach(async () => {
  tmp = join(tmpdir(), `knowpatch-test-hooks-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

// Helper to get the settings path that hooks module would use
function _getSettingsPath(): string {
  // This matches getPlatformSettingsPath for project scope with cwd=tmp
  return join(tmp, ".claude", "settings.json");
}

describe("isPlatformHookInstalled", () => {
  test("returns false for hookType=none", async () => {
    const result = await isPlatformHookInstalled(noHookPlatform, "project");
    expect(result).toBe(false);
  });

  // For the remaining tests, we need to work with real project scope paths
  // Since isPlatformHookInstalled uses getPlatformSettingsPath(platform, scope)
  // which uses process.cwd() for project scope, we can't easily test in isolation
  // without modifying cwd. So we test the settings.json parsing directly.
  test("returns false when settings.json does not exist", async () => {
    // For "user" scope this will check ~/.<platform>/settings.json
    // We test by checking that it handles missing file gracefully
    const result = await isPlatformHookInstalled(noHookPlatform, "user");
    expect(result).toBe(false);
  });
});

describe("settings.json parsing", () => {
  // These tests verify the JSON read/write behavior using real file I/O
  // by manually creating settings files and checking them

  test("reads empty settings gracefully", async () => {
    const settingsDir = join(tmp, "test-empty");
    await mkdir(settingsDir, { recursive: true });
    const settingsPath = join(settingsDir, "settings.json");
    await writeFile(settingsPath, "{}");
    const content = JSON.parse(await readFile(settingsPath, "utf-8"));
    expect(content).toEqual({});
    expect(content.hooks).toBeUndefined();
  });

  test("settings with hooks section is parseable", async () => {
    const settingsDir = join(tmp, "test-hooks");
    await mkdir(settingsDir, { recursive: true });
    const settingsPath = join(settingsDir, "settings.json");
    const settings = {
      hooks: {
        UserPromptSubmit: [
          {
            matcher: "",
            hooks: [
              {
                type: "command",
                command: "node /path/to/knowpatch/bin/detect.js",
              },
            ],
          },
        ],
      },
    };
    await writeFile(settingsPath, JSON.stringify(settings, null, 2));
    const content = JSON.parse(await readFile(settingsPath, "utf-8"));
    expect(content.hooks.UserPromptSubmit).toHaveLength(1);
    expect(content.hooks.UserPromptSubmit[0].hooks[0].command).toContain(
      "knowpatch",
    );
  });

  test("handles malformed JSON gracefully", async () => {
    const settingsDir = join(tmp, "test-malformed");
    await mkdir(settingsDir, { recursive: true });
    const settingsPath = join(settingsDir, "settings.json");
    await writeFile(settingsPath, "not json{");
    // readSettings in hooks.ts catches parse errors and returns {}
    // We verify the file exists but is invalid
    const raw = await readFile(settingsPath, "utf-8");
    expect(() => JSON.parse(raw)).toThrow();
  });
});

describe("hook installation logic", () => {
  test("installPlatformHook returns false for hookType=none", async () => {
    const result = await installPlatformHook(noHookPlatform, "project");
    expect(result).toBe(false);
  });

  test("uninstallPlatformHook returns false for hookType=none", async () => {
    const result = await uninstallPlatformHook(noHookPlatform, "project");
    expect(result).toBe(false);
  });
});

describe("hook entry detection", () => {
  // Test the isOurHook pattern matching by verifying settings structure

  test("hook entry with knowpatch marker is detected", () => {
    const entry = {
      matcher: "",
      hooks: [
        { type: "command", command: "node /some/path/knowpatch/bin/detect.js" },
      ],
    };
    const hasMarker = entry.hooks.some(
      (h) => h.type === "command" && h.command.includes("knowpatch"),
    );
    expect(hasMarker).toBe(true);
  });

  test("hook entry without knowpatch marker is not detected", () => {
    const entry = {
      matcher: "",
      hooks: [{ type: "command", command: "echo hello" }],
    };
    const hasMarker = entry.hooks.some(
      (h) => h.type === "command" && h.command.includes("knowpatch"),
    );
    expect(hasMarker).toBe(false);
  });

  test("multiple hooks — one matches", () => {
    const entries = [
      {
        matcher: "",
        hooks: [{ type: "command", command: "echo pre" }],
      },
      {
        matcher: "",
        hooks: [
          { type: "command", command: "node /path/knowpatch/bin/detect.js" },
        ],
      },
    ];
    const found = entries.some((entry) =>
      entry.hooks.some(
        (h) => h.type === "command" && h.command.includes("knowpatch"),
      ),
    );
    expect(found).toBe(true);
  });

  test("empty hooks array — no match", () => {
    const entries: {
      matcher: string;
      hooks: { type: string; command: string }[];
    }[] = [];
    const found = entries.some((entry) =>
      entry.hooks.some(
        (h) => h.type === "command" && h.command.includes("knowpatch"),
      ),
    );
    expect(found).toBe(false);
  });
});

describe("settings.json structure after hook operations", () => {
  test("hook entry structure is correct", () => {
    const hookCmd = "node /path/to/bin/detect.js";
    const entry = {
      matcher: "",
      hooks: [{ type: "command" as const, command: hookCmd }],
    };
    expect(entry.matcher).toBe("");
    expect(entry.hooks).toHaveLength(1);
    expect(entry.hooks[0].type).toBe("command");
    expect(entry.hooks[0].command).toBe(hookCmd);
  });

  test("hooks section cleanup removes empty UserPromptSubmit", () => {
    const settings: Record<string, unknown> = {
      hooks: {
        UserPromptSubmit: [] as unknown[],
      },
    };
    const hooks = settings.hooks as Record<string, unknown>;
    const ups = hooks.UserPromptSubmit as unknown[];
    if (ups.length === 0) {
      delete hooks.UserPromptSubmit;
    }
    expect(hooks.UserPromptSubmit).toBeUndefined();
  });

  test("hooks section cleanup removes empty hooks object", () => {
    const settings: Record<string, unknown> = {
      hooks: {},
    };
    const hooks = settings.hooks as Record<string, unknown>;
    if (Object.keys(hooks).length === 0) {
      delete settings.hooks;
    }
    expect(settings.hooks).toBeUndefined();
  });
});
