import { quoteShellArgument } from "./arguments";
import { isUsername } from "./helpIdentity";
import type { BilingualText, CommandInputs } from "./types";

export const sudoModeFlags: Record<string, string | undefined> = {
  run: undefined,
  login: "-i",
  shell: "-s",
  list: "-l",
  validate: "-v",
  invalidate: "-k",
};

// Deliberately a small executable-token subset, not a shell parser.
export function isExecutable(value: string): boolean {
  return (
    /^(?:[A-Za-z_][A-Za-z0-9_.+-]*|(?:\/|\.\.?\/)[A-Za-z0-9_./+-]+)$/.test(
      value,
    ) && ![".", ".."].includes(value)
  );
}

export function literalCommandArguments(values: string[]): string[] {
  // One untouched default row means no arguments. Added rows may be empty literals.
  return values.length === 1 && values[0] === "" ? [] : values;
}

export function serializeInnerCommand(
  executable: string,
  arguments_: string[],
): string {
  return [executable, ...literalCommandArguments(arguments_)]
    .map(quoteShellArgument)
    .join(" ");
}

export function buildSudo(inputs: CommandInputs): string {
  if (inputs.mode === "invalidate") return "sudo -k";
  const tokens = ["sudo", "-u", quoteShellArgument(inputs.user as string)];
  if (inputs.group)
    tokens.push("-g", quoteShellArgument(inputs.group as string));
  const flag = sudoModeFlags[inputs.mode as string];
  if (flag) tokens.push(flag);
  if (inputs.mode === "run")
    tokens.push(
      "--",
      quoteShellArgument(inputs.executable as string),
      ...literalCommandArguments(inputs.arguments as string[]).map(
        quoteShellArgument,
      ),
    );
  return tokens.join(" ");
}

export function buildSu(inputs: CommandInputs): string {
  const tokens = ["su"];
  if (inputs.mode === "login") tokens.push("-l");
  if (inputs.preserve && inputs.mode !== "login") tokens.push("-m");
  if (inputs.mode === "command") {
    // The inner command is one POSIX simple command; outer quoting protects that whole string.
    tokens.push(
      "-s",
      quoteShellArgument("/bin/sh"),
      "-c",
      quoteShellArgument(
        serializeInnerCommand(
          inputs.executable as string,
          inputs.arguments as string[],
        ),
      ),
    );
  } else if (inputs.shell)
    tokens.push("-s", quoteShellArgument(inputs.shell as string));
  if (inputs.user) tokens.push("--", quoteShellArgument(inputs.user as string));
  return tokens.join(" ");
}

export function validatePrivilegeInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  if (commandId !== "sudo" && commandId !== "su") return [];
  if (commandId === "sudo" && inputs.mode === "invalidate") return [];
  if (
    (inputs.user !== "" && !isUsername(inputs.user as string)) ||
    (commandId === "sudo" &&
      inputs.group !== "" &&
      !isUsername(inputs.group as string))
  )
    return [
      {
        en: "Use a common account/group name, starting with a letter or _. Numeric IDs and domain-qualified names are not supported.",
        id: "Gunakan nama akun/grup umum yang diawali huruf atau _. ID angka dan nama dengan domain tidak didukung.",
      },
    ];
  const hasCommand =
    commandId === "sudo" ? inputs.mode === "run" : inputs.mode === "command";
  if (hasCommand && !isExecutable(inputs.executable as string))
    return [
      {
        en: "Enter one executable name or a simple absolute/relative executable path. No whitespace, options, shell operators, variables, or substitutions in this field; add literal arguments separately.",
        id: "Masukkan satu nama program atau jalur program absolut/relatif sederhana. Tanpa spasi, opsi, operator shell, variabel, atau substitusi dalam kolom ini; tambahkan argumen literal secara terpisah.",
      },
    ];
  if (
    commandId === "su" &&
    inputs.mode !== "command" &&
    inputs.shell !== "" &&
    !/^\/[A-Za-z0-9_./+-]+$/.test(inputs.shell as string)
  )
    return [
      {
        en: "The shell must be a simple absolute path such as /bin/bash. Its existence and authorization are not checked.",
        id: "Shell harus berupa jalur absolut sederhana seperti /bin/bash. Keberadaan dan izinnya tidak diperiksa.",
      },
    ];
  return [];
}
