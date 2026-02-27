import { afterEach, describe, expect, test } from "bun:test";
import {
  detectPackageManager,
  getUpdateCommand,
} from "../src/core/package-manager.js";

describe("detectPackageManager", () => {
  const originalEnv = process.env.npm_config_user_agent;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalEnv;
    }
  });

  test("bun user-agent returns bun", () => {
    process.env.npm_config_user_agent = "bun/1.1.0";
    expect(detectPackageManager()).toBe("bun");
  });

  test("npm user-agent returns npm", () => {
    process.env.npm_config_user_agent = "npm/10.0.0 node/v20.0.0";
    expect(detectPackageManager()).toBe("npm");
  });

  test("pnpm user-agent returns pnpm", () => {
    process.env.npm_config_user_agent = "pnpm/9.0.0";
    expect(detectPackageManager()).toBe("pnpm");
  });

  test("yarn user-agent returns yarn", () => {
    process.env.npm_config_user_agent = "yarn/4.0.0";
    expect(detectPackageManager()).toBe("yarn");
  });

  test("no user-agent falls back to path-based detection or npm", () => {
    delete process.env.npm_config_user_agent;
    const pm = detectPackageManager();
    // Should return a valid PackageManager (path-based or npm fallback)
    expect(["bun", "npm", "pnpm", "yarn"]).toContain(pm);
  });
});

describe("getUpdateCommand", () => {
  const originalEnv = process.env.npm_config_user_agent;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalEnv;
    }
  });

  test("includes knowpatch in the command", () => {
    const cmd = getUpdateCommand();
    expect(cmd).toContain("knowpatch");
  });

  test("bun PM produces bun update command", () => {
    process.env.npm_config_user_agent = "bun/1.1.0";
    expect(getUpdateCommand()).toBe("bun update -g knowpatch");
  });

  test("npm PM produces npm update command", () => {
    process.env.npm_config_user_agent = "npm/10.0.0";
    expect(getUpdateCommand()).toBe("npm update -g knowpatch");
  });

  test("yarn PM produces yarn global upgrade command", () => {
    process.env.npm_config_user_agent = "yarn/4.0.0";
    expect(getUpdateCommand()).toBe("yarn global upgrade knowpatch");
  });
});
