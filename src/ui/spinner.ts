import ora, { type Ora } from "ora";

export function startSpinner(text: string): Ora {
  return ora({
    text,
    indent: 2,
    spinner: "dots",
  }).start();
}
