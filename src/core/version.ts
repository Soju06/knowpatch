import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

interface UpdateCheckCache {
  latestVersion: string;
  checkedAt: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000;
const CACHE_PATH = resolve(homedir(), ".cache/knowpatch/update-check.json");
const REGISTRY_URL = "https://registry.npmjs.org/knowpatch/latest";

function isNewer(latest: string, current: string): boolean {
  const l = latest.split(".").map(Number);
  const c = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const lv = l[i] ?? 0;
    const cv = c[i] ?? 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

async function readCache(): Promise<UpdateCheckCache | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw) as UpdateCheckCache;
  } catch {
    return null;
  }
}

async function writeCache(cache: UpdateCheckCache): Promise<void> {
  await mkdir(dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache), "utf-8");
}

async function fetchLatest(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

/** Check npm registry for a newer version. Returns newer version string or null. */
export async function checkForUpdate(
  currentVersion: string,
): Promise<string | null> {
  const cache = await readCache();
  const now = Date.now();

  if (cache && now - cache.checkedAt < CACHE_TTL) {
    return isNewer(cache.latestVersion, currentVersion)
      ? cache.latestVersion
      : null;
  }

  const latest = await fetchLatest();
  if (!latest) return null;

  await writeCache({ latestVersion: latest, checkedAt: now }).catch(() => {});

  return isNewer(latest, currentVersion) ? latest : null;
}
