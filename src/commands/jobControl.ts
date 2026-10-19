import { quoteShellArgument } from "./arguments";
import { isExecutable, literalCommandArguments } from "./privileges";
import { isPositiveProcessInteger } from "./processes";
import type { BilingualText, CommandInputs } from "./types";

export function isBackgroundExecutable(value: string): boolean {
  // Literal paths may contain spaces; operators, expansion syntax and scripts are excluded.
  return (
    isExecutable(value) ||
    (/^(?:\/|\.\.?\/)[A-Za-z0-9_./+ '~-]+$/.test(value) &&
      value === value.trim() &&
      !value.endsWith("/"))
  );
}

export function buildBackground(inputs: CommandInputs): string {
  const tokens = [
    inputs.executable as string,
    ...literalCommandArguments(inputs.arguments as string[]),
  ];
  // Only this trusted final token is shell syntax. Every user token stays literal.
  return tokens.map(quoteShellArgument).join(" ") + " &";
}

export function buildJobControl(
  name: "fg" | "bg",
  inputs: CommandInputs,
): string {
  if (inputs.selection === "previous") return `${name} %-`;
  if (inputs.selection === "explicit-current") return `${name} %+`;
  if (inputs.selection === "number")
    return `${name} %${Number(inputs.jobNumber)}`;
  return name;
}

export function validateJobControlInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  if (
    commandId === "background" &&
    !isBackgroundExecutable(inputs.executable as string)
  )
    return [
      {
        en: "Enter one executable name or an absolute/./../ executable path. Paths may contain spaces; shell operators, variables and substitutions are not supported. Add literal arguments separately.",
        id: "Masukkan satu nama program atau jalur program absolut/./../. Jalur boleh mengandung spasi; operator shell, variabel, dan substitusi tidak didukung. Tambahkan argumen literal secara terpisah.",
      },
    ];
  if (
    (commandId === "fg" || commandId === "bg") &&
    inputs.selection === "number" &&
    !isPositiveProcessInteger(inputs.jobNumber as string)
  )
    return [
      {
        en: "Use a positive job number from 1 to 2147483647, without %, signs, or shell expressions. This is a job number, not a PID.",
        id: "Gunakan nomor job positif dari 1 hingga 2147483647, tanpa %, tanda, atau ekspresi shell. Ini nomor job, bukan PID.",
      },
    ];
  return [];
}
