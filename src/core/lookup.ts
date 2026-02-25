import { execSync } from "node:child_process";

export interface LookupResult {
  command: string;
  version: string | null;
  error: string | null;
}

/** Run an npm version lookup */
export function npmVersion(pkg: string): LookupResult {
  const command = `npm view ${pkg} version`;
  return runLookup(command);
}

/** Run a pip version lookup */
export function pipVersion(pkg: string): LookupResult {
  const command = `pip index versions ${pkg} | head -1`;
  return runLookup(command);
}

/** Run a cargo version lookup */
export function cargoVersion(pkg: string): LookupResult {
  const command = `cargo search ${pkg} --limit 1`;
  return runLookup(command);
}

/** Execute a lookup command string (from corrections entries) */
export function runLookupCommand(lookupStr: string): LookupResult {
  // Extract the actual command from the lookup string
  // Format: "`npm view shadcn version`" or "npm view shadcn version"
  const cmdMatch = lookupStr.match(/`([^`]+)`/);
  const command = cmdMatch ? (cmdMatch[1] ?? lookupStr.trim()) : lookupStr.trim();
  return runLookup(command);
}

/** Run a shell command and capture output */
function runLookup(command: string): LookupResult {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      timeout: 15_000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    return { command, version: output || null, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return { command, version: null, error: message };
  }
}
