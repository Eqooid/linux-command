import type { GenerationResult } from "./types";

// These targets support --help in the GNU/Linux implementations documented here.
// This list is separate from the implemented builder catalog.
export const helpTargets = [
  "ls",
  "mkdir",
  "touch",
  "cp",
  "mv",
  "rm",
  "cat",
  "find",
  "grep",
  "whoami",
  "id",
  "groups",
  "man",
  "nano",
  "chmod",
  "chown",
] as const;

const shellWords = new Set([
  "cd",
  "pwd",
  "help",
  "alias",
  "unalias",
  "source",
  "export",
  "readonly",
  "read",
  "eval",
  "exec",
  "set",
  "unset",
  "shift",
  "exit",
  "return",
  "break",
  "continue",
  "echo",
  "printf",
  "test",
  "true",
  "false",
  "command",
  "builtin",
  "type",
  "enable",
  "local",
  "declare",
  "typeset",
  "let",
  "umask",
  "ulimit",
  "trap",
  "wait",
  "jobs",
  "fg",
  "bg",
  "disown",
  "pushd",
  "popd",
  "dirs",
  "history",
  "shopt",
  "getopts",
  "hash",
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "while",
  "until",
  "do",
  "done",
  "case",
  "esac",
  "in",
  "function",
  "select",
  "time",
  "coproc",
]);

export function generateHelpCommand(
  target: string,
  custom: string = "",
): GenerationResult {
  if (target !== "custom" && !helpTargets.some((name) => name === target))
    return {
      command: null,
      errors: [
        {
          en: "Select a supported help target.",
          id: "Pilih target bantuan yang didukung.",
        },
      ],
    };
  const name = target === "custom" ? custom : target;
  if (!/^[A-Za-z_][A-Za-z0-9_.+-]*$/.test(name))
    return {
      command: null,
      errors: [
        {
          en: "Enter one executable name starting with a letter or _. Only letters, digits, _, ., + and - are supported; no spaces, paths, shell expressions, or operators.",
          id: "Masukkan satu nama program yang diawali huruf atau _. Hanya huruf, angka, _, ., + dan - didukung; tanpa spasi, jalur, ekspresi shell, atau operator.",
        },
      ],
    };
  if (shellWords.has(name))
    return {
      command: null,
      errors: [
        {
          en: "This is a shell keyword or commonly a builtin. In Bash, consult help command or the shell manual; --help is not universal.",
          id: "Ini kata kunci shell atau biasanya builtin. Dalam Bash, gunakan help command atau manual shell; --help tidak berlaku universal.",
        },
      ],
    };
  if (name.length > 200)
    return {
      command: null,
      errors: [
        {
          en: "Executable names are limited to 200 characters.",
          id: "Nama program dibatasi 200 karakter.",
        },
      ],
    };
  return { command: `${name} --help`, errors: [] };
}
