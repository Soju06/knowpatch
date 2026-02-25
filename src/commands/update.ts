import { confirm } from "@inquirer/prompts";
import { parseCorrections, type CorrectionEntry } from "../core/parser.js";
import { runLookupCommand } from "../core/lookup.js";
import { updateEntry } from "../core/writer.js";
import { isInteractive } from "../ui/interactive.js";
import { startSpinner } from "../ui/spinner.js";
import { COLORS, ICONS, separator, header } from "../ui/palette.js";

interface DriftItem {
  entry: CorrectionEntry;
  liveVersion: string;
}

interface UpdateOptions {
  yes?: boolean;
}

export async function updateCommand(options: UpdateOptions): Promise<void> {
  const scanSpinner = startSpinner("Scanning for drift...");
  const entries = await parseCorrections();

  if (entries.length === 0) {
    scanSpinner.info("No entries with lookup commands found.");
    return;
  }

  scanSpinner.stop();
  console.log(header("Knowpatch — Update"));

  const drifted: DriftItem[] = [];

  for (const entry of entries) {
    const spinner = startSpinner(`Checking ${entry.package}...`);
    const lookup = runLookupCommand(entry.lookup);

    if (lookup.error) {
      spinner.stop();
      console.log(`  ${ICONS.error} ${COLORS.dim(`${entry.id} — skipped (error)`)}`);
      continue;
    }

    if (
      entry.cached_version &&
      lookup.version &&
      !lookup.version.includes(entry.cached_version)
    ) {
      spinner.stop();
      console.log(
        `  ${ICONS.drift} ${entry.id} ${COLORS.dim(`${entry.cached_version} ${ICONS.arrow} ${lookup.version}`)}`,
      );
      drifted.push({ entry, liveVersion: lookup.version });
    } else {
      spinner.stop();
      console.log(`  ${ICONS.ok} ${COLORS.dim(entry.id)}`);
    }
  }

  if (drifted.length === 0) {
    console.log(`\n  ${COLORS.success("All entries are up to date.")}`);
    return;
  }

  // Show proposed updates
  console.log(separator("Proposed Updates"));
  for (const item of drifted) {
    console.log(
      `  ${COLORS.dim(`[${item.entry.file}]`)} ${item.entry.id.padEnd(18)} ${item.entry.cached_version} ${ICONS.arrow} ${COLORS.version(item.liveVersion)}`,
    );
  }
  console.log();

  // Confirm unless --yes
  if (!options.yes && isInteractive()) {
    const proceed = await confirm({
      message: "Apply these updates?",
      default: true,
    });
    if (!proceed) {
      console.log(`  ${COLORS.dim("Cancelled.")}`);
      return;
    }
  }

  // Apply updates using YAML-aware writer
  for (const item of drifted) {
    await updateEntry(item.entry.file, item.entry.id, item.liveVersion);
    console.log(
      `  ${ICONS.ok} Updated ${item.entry.id}: ${item.entry.cached_version} ${ICONS.arrow} ${COLORS.version(item.liveVersion)}`,
    );
  }

  console.log(`\n  ${COLORS.success("Done.")} Review changes with ${COLORS.dim("git diff")}.`);
}
