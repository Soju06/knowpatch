import { lstat, readlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { isPlatformHookInstalled, isPlatformHookUpToDate } from "./hooks.js";
import {
  getAgentsSkillPath,
  getPlatformSkillPath,
  isCanonicalInstalled,
  isSameRealPath,
  type Scope,
} from "./paths.js";
import { PLATFORMS, type PlatformConfig } from "./platforms.js";

interface CanonicalStatus {
  exists: boolean;
  valid: boolean;
  isLegacySymlink: boolean;
}

export interface PlatformStatus {
  platform: PlatformConfig;
  installed: boolean;
  symlinkValid: boolean;
  implicitlyLinked: boolean;
  hookInstalled: boolean;
  hookUpToDate: boolean;
}

export interface InstallationStatus {
  scope: Scope;
  canonical: CanonicalStatus;
  platforms: PlatformStatus[];
}

export async function detectInstallation(
  scope: Scope,
): Promise<InstallationStatus> {
  const canonicalPath = getAgentsSkillPath(scope);

  // Canonical status
  let exists = false;
  let valid = false;
  let isLegacySymlink = false;

  try {
    const s = await lstat(canonicalPath);
    exists = true;
    if (s.isSymbolicLink()) {
      isLegacySymlink = true;
    } else if (s.isDirectory()) {
      valid = await isCanonicalInstalled(canonicalPath);
    }
  } catch {
    // path does not exist
  }

  const canonical: CanonicalStatus = { exists, valid, isLegacySymlink };

  // Platform status
  const platforms: PlatformStatus[] = [];
  for (const platform of PLATFORMS) {
    const platformPath = getPlatformSkillPath(platform, scope);
    let installed = false;
    let symlinkValid = false;
    let implicitlyLinked = false;

    try {
      const s = await lstat(platformPath);
      if (s.isSymbolicLink()) {
        const link = await readlink(platformPath);
        const resolved = resolve(dirname(platformPath), link);
        if (resolved === resolve(canonicalPath)) {
          installed = true;
          symlinkValid = true;
        }
      }
    } catch {
      // path does not exist
    }

    // Parent-level symlink check (e.g. .claude → .agents)
    if (!installed) {
      implicitlyLinked = await isSameRealPath(platformPath, canonicalPath);
      if (implicitlyLinked) {
        installed = true;
      }
    }

    const hookInstalled = await isPlatformHookInstalled(platform, scope);
    const hookUpToDate = hookInstalled
      ? await isPlatformHookUpToDate(platform, scope)
      : false;

    platforms.push({
      platform,
      installed,
      symlinkValid,
      implicitlyLinked,
      hookInstalled,
      hookUpToDate,
    });
  }

  return { scope, canonical, platforms };
}
