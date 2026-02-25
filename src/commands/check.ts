import { parseCorrections, type CorrectionEntry } from "../core/parser.js";
import { runLookupCommand, type LookupResult } from "../core/lookup.js";
import { startSpinner } from "../ui/spinner.js";
import { COLORS, ICONS, statusLine, separator, header } from "../ui/palette.js";

interface CheckResult {
  entry: CorrectionEntry;
  lookup: LookupResult;
  status: "ok" | "drift" | "error";
}

export async function checkCommand(): Promise<void> {
  const loadSpinner = startSpinner("Loading corrections...");
  const entries = await parseCorrections();

  if (entries.length === 0) {
    loadSpinner.info("No entries with lookup commands found.");
    return;
  }

  loadSpinner.stop();
  console.log(header("Knowpatch — Check"));

  const results: CheckResult[] = [];

  for (const entry of entries) {
    const spinner = startSpinner(`Checking ${entry.package}...`);
    const lookup = runLookupCommand(entry.lookup);

    let status: CheckResult["status"];
    if (lookup.error) {
      status = "error";
      spinner.stop();
      console.log(statusLine("error", `${entry.id}`));
    } else if (
      entry.cached_version &&
      lookup.version &&
      !lookup.version.includes(entry.cached_version)
    ) {
      status = "drift";
      spinner.stop();
      console.log(
        statusLine(
          "drift",
          `${entry.id} ${COLORS.dim(`(${entry.cached_version} ${ICONS.arrow} ${lookup.version})`)}`,
        ),
      );
    } else {
      status = "ok";
      spinner.stop();
      console.log(statusLine("ok", entry.id));
    }

    results.push({ entry, lookup, status });
  }

  // Summary
  const ok = results.filter((r) => r.status === "ok").length;
  const drift = results.filter((r) => r.status === "drift").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(separator("Summary"));
  console.log(
    `  ${COLORS.success(`OK ${ok}`)}    ${COLORS.warn(`DRIFT ${drift}`)}    ${COLORS.error(`ERROR ${errors}`)}`,
  );

  if (drift > 0) {
    console.log(separator("Drifted"));
    for (const r of results.filter((r) => r.status === "drift")) {
      console.log(
        `  ${r.entry.id.padEnd(20)} ${COLORS.dim(r.entry.cached_version ?? "?")} ${ICONS.arrow} ${COLORS.version(r.lookup.version ?? "?")}`,
      );
    }
  }

  if (errors > 0) {
    console.log(separator("Errors"));
    for (const r of results.filter((r) => r.status === "error")) {
      console.log(
        `  ${r.entry.id.padEnd(20)} ${COLORS.error(r.lookup.error?.split("\n")[0] ?? "unknown")}`,
      );
    }
  }

  console.log();

  if (drift > 0) {
    process.exit(1);
  }
}
