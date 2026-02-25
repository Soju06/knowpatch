export function isInteractive(): boolean {
  // CI environments
  if (process.env["CI"] || process.env["CONTINUOUS_INTEGRATION"]) return false;
  // NO_COLOR convention
  if (process.env["NO_COLOR"]) return false;
  // Non-TTY stdin
  if (!process.stdin.isTTY) return false;
  return true;
}
