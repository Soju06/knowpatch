import { describe, expect, test } from "bun:test";
import { PLATFORMS } from "../src/core/platforms.js";

describe("PLATFORMS", () => {
  test("has exactly 3 platforms", () => {
    expect(PLATFORMS).toHaveLength(3);
  });

  test("no duplicate IDs", () => {
    const ids = PLATFORMS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test("each platform has all required fields", () => {
    for (const p of PLATFORMS) {
      expect(typeof p.id).toBe("string");
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.displayName).toBe("string");
      expect(p.displayName.length).toBeGreaterThan(0);
      expect(typeof p.configDir).toBe("string");
      expect(p.configDir.length).toBeGreaterThan(0);
      expect(typeof p.skillsSubpath).toBe("string");
      expect(typeof p.supportsHooks).toBe("boolean");
      expect(["claude-settings-json", "none"]).toContain(p.hookType);
    }
  });

  test("only claude supports hooks", () => {
    const withHooks = PLATFORMS.filter((p) => p.supportsHooks);
    expect(withHooks).toHaveLength(1);
    expect(withHooks[0].id).toBe("claude");
  });

  test("configDir starts with dot", () => {
    for (const p of PLATFORMS) {
      expect(p.configDir).toStartWith(".");
    }
  });

  test("contains expected platform IDs", () => {
    const ids = PLATFORMS.map((p) => p.id);
    expect(ids).toContain("claude");
    expect(ids).toContain("codex");
    expect(ids).toContain("gemini");
  });
});
